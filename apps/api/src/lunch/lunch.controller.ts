import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LunchAttendanceDto } from '../dto/lunch.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';
import { LunchService } from './lunch.service';
@Controller('lunch')
export class LunchController {
  constructor(private lunchService: LunchService) {}
  @Post('attendance')
  @UseGuards(AuthGuard)
  async markAttendance(@CurrentUser() user, @Body() dto: LunchAttendanceDto) {
    return this.lunchService.lunchAttendance(user.id, dto);
  }

  @Get('attendance-summary')
  @UseGuards(AuthGuard)
  async getAttendanceSummary() {
    return this.lunchService.getTodayAttendance();
  }

  @Get('my-attendance')
  @UseGuards(AuthGuard)
  async getMyAttendance(@CurrentUser() user) {
    return this.lunchService.myAttendance(user.id);
  }

  @Post('notify-ready')
  @UseGuards(AuthGuard)
  async notifyLunchReady() {
    return this.lunchService.notifyLunchReady();
  }
}
