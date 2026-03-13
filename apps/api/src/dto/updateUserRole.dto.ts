import { IsEnum, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString({ each: true })
  roles: string[];

  @IsString()
  userId: string;
}
