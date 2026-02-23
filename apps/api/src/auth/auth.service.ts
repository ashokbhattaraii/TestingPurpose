import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private supabase: SupabaseService,
  ) {}

  async googleLogin(googleUser: any) {
    console.log('🔍 Processing Google login for:', googleUser.email);

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
      console.log('✅ Found existing user with Supabase UID:', supabaseUserId);

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
      console.log('✅ Updated Supabase Auth user metadata');
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
      console.log('✅ Created new user in Supabase Auth:', supabaseUserId);
    }

    // Now handle Prisma user record
    if (!user) {
      console.log('➕ Creating user in public schema');

      // Determine role based on email
      // anusha.rajlawat@rumsan.net is admin and aishwarya.maharjan@rumsan.net is super admin, rest are employees
      let role: UserRole = 'EMPLOYEE';
      if (googleUser.email === 'lucyheartfillia662@gmail.com') {
        role = 'ADMIN';
      } else if (googleUser.email === 'aishwarya.maharjan@rumsan.net') {
        role = 'SUPER_ADMIN';
      }

      user = await this.prisma.user.create({
        data: {
          uid: supabaseUserId,
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
          role: role,
          isActive: true,
          lastLoginAt: new Date(),
        },
      });
      console.log('✅ User created in public schema:', user.id);
    } else if (!user.uid) {
      // User exists but doesn't have UID - link it
      console.log('✏️ Linking existing user to Supabase Auth');
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          uid: supabaseUserId,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // User exists with UID - just update
      console.log('✏️ Updating existing user in public schema');
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          photoURL: googleUser.picture,
        },
      });
      console.log('✅ User updated in public schema');
    }

    console.log('🔐 Generating JWT token');

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
      },
    };
  }
}
