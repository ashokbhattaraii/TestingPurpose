import { Module } from '@nestjs/common';
import { LaunchController } from './launch.controller';
import { LaunchService } from './launch.service';
import { SlackModule } from '../slack/slack.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SlackModule, PrismaModule],
  controllers: [LaunchController],
  providers: [LaunchService],
})
export class LaunchModule {}
