import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  IssueCategory,
  IssuePriority,
  RequestType,
  SuppliesCategory,
} from '@prisma/client';

export class UpdateIssueDetailsDto {
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @IsEnum(IssueCategory)
  @IsOptional()
  category?: IssueCategory;

  @IsOptional()
  @IsString()
  otherCategoryDetails?: string | null;

  @IsOptional()
  @IsString()
  location?: string | null;
}

export class UpdateSuppliesDetailsDto {
  @IsEnum(SuppliesCategory)
  @IsOptional()
  category?: SuppliesCategory;

  @IsOptional()
  @IsString()
  otherCategoryDetails?: string | null;

  @IsString()
  @IsOptional()
  itemName?: string;
}

export class UpdateRequestDto {
  @IsEnum(RequestType)
  @IsOptional()
  type?: RequestType;

  @IsString()
  @IsOptional()
  @MinLength(3)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  isAnonymous?: boolean;

  // ISSUE-specific fields
  @ValidateNested()
  @Type(() => UpdateIssueDetailsDto)
  @IsOptional()
  issueDetails?: UpdateIssueDetailsDto;

  // SUPPLIES-specific fields
  @ValidateNested()
  @Type(() => UpdateSuppliesDetailsDto)
  @IsOptional()
  suppliesDetails?: UpdateSuppliesDetailsDto;
}
