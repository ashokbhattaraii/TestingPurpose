import { IsBoolean, IsString } from 'class-validator';
import { LaunchType } from '@prisma/client';

export class LaunchAttendanceDto {
  @IsBoolean()
  isAttending: boolean;

  @IsString()
  preferredLunchOption: LaunchType;
}
