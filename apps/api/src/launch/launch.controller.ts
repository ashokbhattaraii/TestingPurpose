import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LaunchAttendanceDto } from '../dto/launch.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';
import { LaunchService } from './launch.service';
@Controller('launch')
export class LaunchController {
  constructor(private launchService: LaunchService) { }
  @Post('attendance')
  @UseGuards(AuthGuard)
  async markAttendance(@CurrentUser() user, @Body() dto: LaunchAttendanceDto) {
    return this.launchService.launchAttendance(user.id, dto);
  }

  @Get('attendance-summary')
  @UseGuards(AuthGuard)
  async getAttendanceSummary() {
    return this.launchService.getTodayAttendance();
  }

  @Get('my-attendance')
  @UseGuards(AuthGuard)
  async getMyAttendance(@CurrentUser() user) {
    return this.launchService.myAttendance(user.id);
  }
}
