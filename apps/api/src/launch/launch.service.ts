import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LaunchAttendanceDto } from '../dto/launch.dto';
import { LaunchType } from '@prisma/client';

@Injectable()
export class LaunchService {
  constructor(private prisma: PrismaService) {}

  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private checkAttendanceWindow(): void {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      9,
      45,
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      11,
      0,
    );

    // if (now < start || now > end) {
    //   throw new BadRequestException(
    //     'Attendance can only be marked between 9:45 AM and 11:00 AM',
    //   );
    // }
  }

  async launchAttendance(userId: string, dto: LaunchAttendanceDto) {
    const today = this.toDateOnly(new Date());
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
    const today = this.toDateOnly(new Date());

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
    const today = this.toDateOnly(new Date());
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
            role: true,
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
