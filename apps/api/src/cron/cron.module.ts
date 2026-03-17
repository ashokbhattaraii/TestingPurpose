import { Module } from '@nestjs/common';
import { SlackCronService } from './slack-cron.service.js';
import { SlackModule } from '../slack/slack.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [SlackModule, PrismaModule],
  providers: [SlackCronService],
})
export class CronModule {}
