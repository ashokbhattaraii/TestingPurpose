import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LunchAttendanceDto } from '../dto/lunch.dto';
import { LunchType } from '@prisma/client';
import { SlackService } from '../slack/slack.service';
import { NotificationGateway } from '../notification/notification.gateway';


@Injectable()
export class LunchService {
  private readonly logger = new Logger(LunchService.name);
  constructor(
    private prisma: PrismaService,
    private slackService: SlackService,
    private notificationGateway: NotificationGateway,
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

    // Prisma considers Date objects to be stored as ISODate. Use UTC midnight to avoid local timezone shifts.
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }
  private checkAttendanceWindow(): void {
    this.logger.log('Attendance window check bypassed for testing');
  }

  async lunchAttendance(userId: string, dto: LunchAttendanceDto) {
    this.checkAttendanceWindow();
    const today = this.getKathmanduDateOnly();
    // console.log('Checking attendance window...', dto);
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

    this.notificationGateway.broadcastLunchSummaryUpdate();

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

  async notifyLunchReady() {
    const today = this.getKathmanduDateOnly();

    // Get all attendees who are attending today
    const records = await this.prisma.lunchAttendance.findMany({
      where: { date: today, isAttending: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (records.length === 0) {
      return { message: 'No attendees to notify today.', sent: 0, failed: 0 };
    }

    const attendees = records.map((r) => ({
      email: r.user.email,
      name: r.user.name,
      preferredLunchOption: r.preferredLunchOption ?? 'VEG',
    }));

    const result =
      await this.slackService.sendLunchReadyNotifications(attendees);

    return {
      message: `Lunch ready notifications sent! ${result.sent} delivered, ${result.failed} failed.`,
      ...result,
    };
  }
}
