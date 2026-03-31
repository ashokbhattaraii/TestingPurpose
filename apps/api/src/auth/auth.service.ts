import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
// SupabaseService import yahan bata hataisakeko chha
import type {
  RsOfficeClient,
  AuthResult,
} from '@rumsan/user';

import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';
import { CryptoService } from './crypto.service';

interface ExtendedAuthUser {
  cuid: string;
  name: string;
  email: string;
  thumbnail_url?: string;
  gender?: string;
  department?: string;
  org_unit?: string;
  job_title?: string;
  employment_type?: string;
  phone_home?: string;
  phone_work?: string;
  phone_recovery?: string;
  roles?: string[];
}

interface ExtendedAuthResult extends AuthResult {
  user: ExtendedAuthUser;
  orgUnit?: string;
  jobTitle?: string;
  employmentType?: string;
}

@Injectable()
export class AuthService {
  private readonly appId: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(RS_OFFICE_CLIENT) private readonly rsClient: RsOfficeClient,
    private readonly crypto: CryptoService,
  ) {
    const appId = process.env.APP_ID;
    if (!appId) throw new Error('APP_ID env var is required');
    this.appId = appId;
  }

  async googleLogin(id_token: string) {
    // Authenticate with Rumsan Office Client
    const rsAuthResult = await this.loginWithGoogle(id_token).catch((e) => {
      console.error(
        'Rumsan login failed:',
        e.message,
        '| status:',
        e.status,
        '| details:',
        JSON.stringify(e.details),
      );
      return null;
    });

    const rsAuthResultExtended = rsAuthResult as ExtendedAuthResult;

    // Decode ID token to get profile info
    const jwtContent = JSON.parse(
      Buffer.from(id_token.split('.')[1], 'base64').toString(),
    );

    const rsUser = rsAuthResultExtended?.user;
    const firstName = (rsUser?.name?.split(' ')[0] || jwtContent.given_name || '').trim();
    const lastName = (rsUser?.name?.split(' ').slice(1).join(' ') || jwtContent.family_name || '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const googleUser = {
      email: jwtContent.email,
      firstName,
      lastName,
      fullName,
      picture: rsUser?.thumbnail_url || jwtContent.picture,
      googleId: jwtContent.sub,
      roles: rsAuthResultExtended?.roles || rsUser?.roles || ["employee"],
      cuid: rsUser?.cuid,
      gender: rsUser?.gender,
      department: rsUser?.department,
      orgUnit: rsUser?.org_unit || rsAuthResultExtended?.orgUnit,
      jobTitle: rsUser?.job_title || rsAuthResultExtended?.jobTitle,
      employmentType:
        rsUser?.employment_type || rsAuthResultExtended?.employmentType,
      phoneHome: rsUser?.phone_home,
      phoneWork: rsUser?.phone_work,
      phoneRecovery: rsUser?.phone_recovery,
    };

    // Supabase hatauna 'uid' ko thau ma Google ID wa CUID prayog gareko
    const identifier = googleUser.cuid || googleUser.googleId;

    // First, check if user exists in Prisma by email
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    const finalRoles: string[] =
      googleUser.roles && googleUser.roles.length > 0
        ? googleUser.roles
        : ['employee'];

    if (!user) {
      // Create new user in our Database via Prisma
      user = await this.prisma.user.create({
        data: {
          uid: identifier,
          cuid: googleUser.cuid,
          email: googleUser.email,
          name: googleUser.fullName,
          photoURL: googleUser.picture,
          gender: googleUser.gender,
          roles: finalRoles,
          org_unit: googleUser.orgUnit,
          department: googleUser.department,
          job_title: googleUser.jobTitle,
          employment_type: googleUser.employmentType,
          phone_home: googleUser.phoneHome,
          phone_work: googleUser.phoneWork,
          phone_recovery: googleUser.phoneRecovery,
          isActive: true,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Update existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          roles: finalRoles,
          cuid: googleUser.cuid,
          name: googleUser.fullName,
          photoURL: googleUser.picture,
          gender: googleUser.gender,
          org_unit: googleUser.orgUnit,
          department: googleUser.department,
          job_title: googleUser.jobTitle,
          employment_type: googleUser.employmentType,
          phone_home: googleUser.phoneHome,
          phone_work: googleUser.phoneWork,
          phone_recovery: googleUser.phoneRecovery,
        },
      });
    }

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

  async loginWithGoogle(token: string): Promise<ExtendedAuthResult> {
    const { challenge } = await this.rsClient.auth.getChallenge({
      appId: this.appId,
    });

    const appSignature = this.crypto.signChallenge(challenge);

    const rsAuthResult = await this.rsClient.auth.googleLogin(
      { id_token: token, challenge, app_signature: appSignature },
      { appId: this.appId },
    );

    return rsAuthResult as ExtendedAuthResult;
  }
}