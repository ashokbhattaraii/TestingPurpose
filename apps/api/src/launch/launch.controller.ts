import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LaunchAttendanceDto } from 'src/dto/launch.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator/current-user.decorator';
import { LaunchService } from './launch.service';
@Controller('launch')
export class LaunchController {
  constructor(private launchService: LaunchService) {}
  @Post('attendance')
  @UseGuards(AuthGuard('jwt'))
  async markAttendance(@CurrentUser() user, @Body() dto: LaunchAttendanceDto) {
    return this.launchService.launchAttendance(user.id, dto);
  }

  @Get('attendance-summary')
  @UseGuards(AuthGuard('jwt'))
  async getAttendanceSummary() {
    return this.launchService.getTodayAttendance();
  }

  @Get('my-attendance')
  @UseGuards(AuthGuard('jwt'))
  async getMyAttendance(@CurrentUser() user) {
    return this.launchService.myAttendance(user.id);
  }
}
