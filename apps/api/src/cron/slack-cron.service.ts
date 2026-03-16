import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { SlackService } from '../slack/slack.service.js';
import { LaunchType } from '@prisma/client';

@Injectable()
export class SlackCronService {
  private readonly logger = new Logger(SlackCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService,
  ) { }

  private getKathmanduDateOnly(): Date {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;

    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  // "0 1 11 * * *" means at 11:01:00 AM every day
  // Format: second, minute, hour, day of month, month, day of week
  @Cron('* * * * *')
  async handleDailySlackJob() {
    this.logger.log('⏰ Executing Daily Slack cron job (every minute for testing)...');

    try {
      const today = this.getKathmanduDateOnly();
      const records = await this.prisma.lunchAttendance.findMany({
        where: {
          date: today,
          isAttending: true, // Only count those who are attending
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { user: { name: 'asc' } }, // Sort names alphabetically
      });

      const vegPeople = records.filter(
        (r) => r.preferredLunchOption === LaunchType.VEG,
      );
      const nonVegPeople = records.filter(
        (r) => r.preferredLunchOption === LaunchType.NON_VEG,
      );

      const vegNames = vegPeople.map((r) => r.user.name);
      const nonVegNames = nonVegPeople.map((r) => r.user.name);

      const data = {
        date: today.toISOString().split('T')[0],
        total: records.length,
        vegCount: vegPeople.length,
        nonVegCount: nonVegPeople.length,
        vegNames,
        nonVegNames,
      };

      await this.slackService.sendLunchSummary(data);
      this.logger.log('✅ Daily lunch summary sent to Slack successfully.');
    } catch (error) {
      this.logger.error('❌ Error sending daily lunch summary to Slack', error);
    }
  }
}
