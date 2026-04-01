import { Module } from '@nestjs/common';
import { SlackCronService } from './slack-cron.service';
import { SlackModule } from '../slack/slack.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SlackModule, PrismaModule],
  providers: [SlackCronService],
})
export class CronModule { }
