import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnalyticsService } from './analytics.service';


@Module({
  controllers: [AnalyticsController],
  imports: [PrismaModule],
  providers: [PrismaService,AnalyticsService],
})
export class AnalyticsModule {
 
}
