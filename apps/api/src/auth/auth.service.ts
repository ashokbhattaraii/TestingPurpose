import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { RsOfficeClient, AuthResult } from '@rumsan/user';
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  private readonly appId: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabase: SupabaseService,
    @Inject(RS_OFFICE_CLIENT) private readonly client: RsOfficeClient,
    private readonly crypto: CryptoService,
  ) {
    const appId = process.env.APP_ID;
    if (!appId) throw new Error('APP_ID env var is required');
    this.appId = appId;
  }

  async googleLogin(googleUser: any) {
    console.log(' Processing Google login for:', googleUser.email);

    const supabaseClient = this.supabase.getClient();

    let supabaseUserId: string;
    let isNewUser = false;

    // First, check if user exists in Prisma by email
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user && user.uid) {
      // User exists with Supabase UID
      supabaseUserId = user.uid;
      console.log('Found existing user with Supabase UID:', supabaseUserId);

      // Update Supabase Auth user metadata
      await supabaseClient.auth.admin.updateUserById(supabaseUserId, {
        user_metadata: {
          full_name: `${googleUser.firstName} ${googleUser.lastName}`,
          avatar_url: googleUser.picture,
          provider: 'google',
          google_id: googleUser.googleId,
          last_login: new Date().toISOString(),
        },
      });
      console.log(' Updated Supabase Auth user metadata');
    } else {
      // Create new Supabase Auth user
      const { data: authData, error: authError } =
        await supabaseClient.auth.admin.createUser({
          email: googleUser.email,
          email_confirm: true,
          user_metadata: {
            full_name: `${googleUser.firstName} ${googleUser.lastName}`,
            avatar_url: googleUser.picture,
            provider: 'google',
            google_id: googleUser.googleId,
          },
        });

      if (authError) {
        throw new Error(
          `Failed to create Supabase Auth user: ${authError.message}`,
        );
      }

      supabaseUserId = authData.user.id;
      isNewUser = true;
      console.log(' Created new user in Supabase Auth:', supabaseUserId);
    }

    // Now handle Prisma user record
    if (!user) {
      console.log(' Creating user in public schema');

      // Determine role based on Rumsan dynamic role
      // We map the rumsan string to the UserRole prisma enum 
      // Safely default to EMPLOYEE since Prisma expects SUPER_ADMIN | ADMIN | EMPLOYEE
      let role: UserRole = UserRole.EMPLOYEE;
      const rRole = googleUser.rumsanRole?.toUpperCase();
      if (rRole === 'SUPER_ADMIN' || rRole === 'SUPERADMIN') {
        role = UserRole.SUPER_ADMIN;
      } else if (rRole === 'ADMIN') {
        role = UserRole.ADMIN;
      }

      user = await this.prisma.user.create({
        data: {
          uid: supabaseUserId,
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
          connectedAccounts: {
            create: {
              provider: "google",
              providerAccountId: googleUser.googleId,
              accessToken: googleUser.accessToken,
              refreshToken: googleUser.refreshToken,
              expiresAt: googleUser.expiresAt,
            }
          },
          role: role,
          org_unit: googleUser.orgUnit,
          job_title: googleUser.jobTitle,
          employment_type: googleUser.employmentType,
          isActive: true,
          lastLoginAt: new Date(),
        },
      });
      console.log(' User created in public schema:', user.id);
    } else if (!user.uid) {
      // User exists but doesn't have UID - link it
      console.log('️ Linking existing user to Supabase Auth');

      let role: UserRole = user.role;
      const rRole = googleUser.rumsanRole?.toUpperCase();
      if (rRole === 'SUPER_ADMIN' || rRole === 'SUPERADMIN') role = UserRole.SUPER_ADMIN;
      else if (rRole === 'ADMIN') role = UserRole.ADMIN;

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          uid: supabaseUserId,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
          role: role,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // User exists with UID - just update
      console.log('️ Updating existing user in public schema');
      let role: UserRole = user.role;
      const rRole = googleUser.rumsanRole?.toUpperCase();
      if (rRole === 'SUPER_ADMIN' || rRole === 'SUPERADMIN') role = UserRole.SUPER_ADMIN;
      else if (rRole === 'ADMIN') role = UserRole.ADMIN;

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          role: role,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
        },
      });
      console.log(' User updated in public schema');
    }

    console.log(' Generating JWT token');

    const payload = {
      sub: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,


    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: user.photoURL,
        department: user.department,
        org_unit: user.org_unit,
        job_title: user.job_title,
        employment_type: user.employment_type,
      },
    };
  }

  /**
   * Authenticate a user via Google ID token using the three‑step app auth flow
   * provided by `@rumsan/user`.
   *
   * 1. GET  /auth/challenge?app_id=<APP_ID>   → short‑lived challenge JWT
   * 2. Sign the challenge with the app’s secp256k1 private key
   * 3. POST /auth/google (X‑App‑Id, id_token, challenge, app_signature)
   *    → user JWT
   */
  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const { challenge } = await this.client.auth.getChallenge({ appId: this.appId })

    const appSignature = this.crypto.signChallenge(challenge)

    return this.client.auth.googleLogin(
      { id_token: idToken, challenge, app_signature: appSignature },
      { appId: this.appId },
    )
  }
}
