import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsArray,
  MinLength,
  IsInt,
} from 'class-validator';

import {
  RequestType,
  RequestStatus,
  IssueCategory,
  IssuePriority,
  SuppliesCategory,
} from '@prisma/client';
export class CreateRequestDto {
  @IsEnum(RequestType)
  type: RequestType;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];

  //-----Issue- Specific------

  @IsEnum(IssuePriority)
  @IsOptional()
  issuePriority: IssuePriority;

  @IsEnum(IssueCategory)
  @IsOptional()
  issueCategory: IssueCategory;

  @IsString()
  @IsOptional()
  location?: string;

  //-------supplies-specific

  @IsEnum(SuppliesCategory)
  suppliesCategory: SuppliesCategory;

  @IsString()
  itemName: string;
}
