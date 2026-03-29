import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RequestModule } from './request/request.module';
import { UserModule } from './user/user.module';
import { LunchModule } from './lunch/lunch.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { SlackModule } from './slack/slack.module';
import { CronModule } from './cron/cron.module';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AnalyticsModule,
    ScheduleModule.forRoot(),
    AuthModule,
    SlackModule,
    RequestModule,
    UserModule,
    LunchModule,
    NotificationModule,
    AnnouncementsModule,
    CronModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AnalyticsService],
  exports: [AuthModule],
})
export class AppModule {}
