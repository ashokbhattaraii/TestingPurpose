import { IsBoolean, IsString } from 'class-validator';
import { LunchType } from '@prisma/client';

export class LunchAttendanceDto {
  @IsBoolean()
  isAttending: boolean;

  @IsString()
  preferredLunchOption: LunchType;
}
