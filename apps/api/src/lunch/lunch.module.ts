import { Module, forwardRef } from '@nestjs/common';
import { LunchController } from './lunch.controller';
import { LunchService } from './lunch.service';
import { SlackModule } from '../slack/slack.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [forwardRef(() => SlackModule), PrismaModule, NotificationModule],
  controllers: [LunchController],
  providers: [LunchService],
  exports: [LunchService],
})
export class LunchModule { }

