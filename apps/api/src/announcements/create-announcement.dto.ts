import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString() 
  @IsNotEmpty()
  title: string;

  @IsString() 
  @IsNotEmpty()
  description: string;

  @IsOptional() 
  @IsString()
  expiryDate?: string;
}