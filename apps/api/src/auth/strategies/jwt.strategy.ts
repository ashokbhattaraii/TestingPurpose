import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
    // console.log('Cookie found:', token ? 'Yes' : 'No');
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });

    // console.log('JwtStrategy initialized');
    // console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  }

  async validate(payload: any) {
    // console.log('Validating JWT payload:', payload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    //commit
    if (!user || !user.isActive) {
      // console.log('User not found or inactive');
      throw new UnauthorizedException('User not found or inactive');
    }

    // console.log('JWT validated for user:', user.email);

    return {
      id: user.id,
      uid: user.uid,
      email: user.email,
      roles: user.roles,
      name: user.name,
      org_unit: user.org_unit,
      job_title: user.job_title,
      employment_type: user.employment_type,
      gender: user.gender,
      department: user.department,
      phone: user.phone,
      phone_home: user.phone_home,
      phone_work: user.phone_work,
      phone_recovery: user.phone_recovery,
      lastLogin: user.lastLoginAt,
      active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
