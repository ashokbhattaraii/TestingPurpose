import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
//import { SupabaseModule } from '../supabase/supabase.module';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';
import { RS_OFFICE_CLIENT } from 'src/rsoffice/rsoffice.module';
import { RsOfficeClient } from '@rumsan/user';
import { RsOfficeModule } from 'src/rsoffice/rsoffice.module';
import { CryptoService } from './crypto.service';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [
    PrismaModule,
    //SupabaseModule,

    UserModule,
    RsOfficeModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretkey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, CryptoService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, RsOfficeModule, AuthGuard, CryptoService],
})
export class AuthModule {}
