import { Module } from '@nestjs/common';
import { LunchController } from './lunch.controller';
import { LunchService } from './lunch.service';
import { SlackModule } from '../slack/slack.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SlackModule, PrismaModule],
  controllers: [LunchController],
  providers: [LunchService],
})
export class LunchModule {}
