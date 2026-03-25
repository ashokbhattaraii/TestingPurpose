import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { SlackService } from '../slack/slack.service.js';
import { LunchType } from '@prisma/client';

@Injectable()
export class SlackCronService {
  private readonly logger = new Logger(SlackCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService,
  ) {
    this.logger.log('SlackCronService constructor called');
  }

  @Cron('0 */30 * * * *') // Runs every 30 minutes
  async handleEvery30Minutes() {
    this.logger.log('⏰ Executing Periodic Slack lunch summary (every 30 minutes)...');
    await this.handleDailySlackJob();
  }

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

  async handleDailySlackJob() {
    this.logger.log('⏰ Executing Slack lunch summary job (every 30 minutes)...');

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
        (r) => r.preferredLunchOption === LunchType.VEG,
      );
      const nonVegPeople = records.filter(
        (r) => r.preferredLunchOption === LunchType.NON_VEG,
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
      this.logger.log('Daily lunch summary sent to Slack successfully.');
    } catch (error) {
      this.logger.error(' Error sending daily lunch summary to Slack', error);
    }
  }
}
