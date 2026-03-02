import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseService } from './supabase/supabase.service';
import { SupabaseModule } from './supabase/supabase.module';
import { RequestModule } from './request/request.module';
import { UserModule } from './user/user.module';
import { LaunchModule } from './launch/launch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SupabaseModule,
    RequestModule,
    UserModule,
    LaunchModule,
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
  exports: [AuthModule, SupabaseModule],
})
export class AppModule { }
