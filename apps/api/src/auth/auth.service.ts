import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
    @Inject(RS_OFFICE_CLIENT) private readonly rsClient: RsOfficeClient,
    private readonly crypto: CryptoService,
  ) {
    const appId = process.env.APP_ID;
    if (!appId) throw new Error('APP_ID env var is required');
    this.appId = appId;
  }

  async googleLogin(id_token: string) {
    // Authenticate with Rumsan Office Client to get the user's cross-app role and ID
    const rsAuthResult = await this.loginWithGoogle(id_token).catch(e => {
      console.error("Rumsan login failed:", e.message, "| status:", e.status, "| details:", JSON.stringify(e.details));
      return null;
    });

    console.log("Rumsan login result:", rsAuthResult);

    // Decode ID token to get profile info
    const jwtContent = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
    console.log("Decoded JWT content:", jwtContent);

    const googleUser = {
      email: jwtContent.email,
      firstName: jwtContent.given_name,
      lastName: jwtContent.family_name,
      picture: jwtContent.picture,
      googleId: jwtContent.sub,
      roles: rsAuthResult?.roles,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      orgUnit: undefined,
      jobTitle: undefined,
      employmentType: undefined,
    };

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

    // Assign role from Rumsan result
    let finalRoles: string[] = googleUser.roles || ['employee'];

    if (!user) {
      console.log(' Creating user in public schema');

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
          roles: finalRoles,
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

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          uid: supabaseUserId,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
          roles: finalRoles,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // User exists with UID - just update
      console.log('️ Updating existing user in public schema');

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          roles: finalRoles,
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
      roles: user.roles,


    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        roles: user.roles,
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
  async loginWithGoogle(token: string): Promise<AuthResult> {
    console.log('[RS Auth] Step 1: Getting challenge for appId:', this.appId);
    const { challenge } = await this.rsClient.auth.getChallenge({ appId: this.appId })
    console.log('[RS Auth] Step 1 OK — challenge received (length:', challenge.length, ')');

    console.log('[RS Auth] Step 2: Signing challenge...');
    const appSignature = this.crypto.signChallenge(challenge)
    console.log('[RS Auth] Step 2 OK — signature:', appSignature.slice(0, 20) + '...');

    console.log('[RS Auth] Step 3: Calling googleLogin with id_token, challenge, app_signature');
    const rsAuthResult = (await this.rsClient.auth.googleLogin(
      { id_token: token, challenge, app_signature: appSignature },
      { appId: this.appId },
    )) as AuthResult;
    console.log('[RS Auth] Step 3 OK — roles:', rsAuthResult?.roles);

    return rsAuthResult;
  }
}
