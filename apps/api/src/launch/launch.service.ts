import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LaunchAttendanceDto } from '../dto/launch.dto';
import { LaunchType } from '@prisma/client';
import { SlackService } from '../slack/slack.service';
import { time } from 'console';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class LaunchService {
  private readonly logger = new Logger(LaunchService.name);
  constructor(
    private prisma: PrismaService,
    private slackService: SlackService,
  ) {}

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

    // Prisma considers Date objects to be stored as ISODate. Use UTC midnight to avoid local timezone shifts.
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }
  @Cron('*/1 * * * *')
  async scheduledLunchSlackReport() {
    this.logger.log('⏰ Running scheduled Slack lunch report...');
    console.log('hit');
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
  }

  private checkAttendanceWindow(): void {
    this.logger.log('Attendance window check bypassed for testing');
  }

  async launchAttendance(userId: string, dto: LaunchAttendanceDto) {
    this.checkAttendanceWindow();
    const today = this.getKathmanduDateOnly();
    console.log('Checking attendance window...', dto);
    const attendance = await this.prisma.lunchAttendance.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        isAttending: dto.isAttending,
        preferredLunchOption: dto.preferredLunchOption,
      },
      update: {
        isAttending: dto.isAttending,
        preferredLunchOption: dto.preferredLunchOption,
      },
    });

    return {
      message: dto.isAttending
        ? 'You have successfully marked your attendance for lunch.'
        : 'You have successfully marked your absence for lunch.',
      attendance,
    };
  }

  async getTodayAttendance() {
    const today = this.getKathmanduDateOnly();

    const records = await this.prisma.lunchAttendance.findMany({
      where: { date: today },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      date: today,
      summary: {
        total: records.length,
        attending: records.filter((r) => r.isAttending).length,
      },
      attendances: records.map((r) => ({
        id: r.id,
        userId: r.userId,
        isAttending: r.isAttending,
        preferredLunchOption: r.preferredLunchOption,
        user: r.user,
      })),
    };
  }

  async myAttendance(userId: string) {
    const today = this.getKathmanduDateOnly();
    const attendance = await this.prisma.lunchAttendance.findUnique({
      where: {
        userId_date: { userId, date: today },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
          },
        },
      },
    });
    const returnMsg = {
      message: 'Your attendance for today fetched successfully',
      attendance,
    };
    return returnMsg;
  }
}
