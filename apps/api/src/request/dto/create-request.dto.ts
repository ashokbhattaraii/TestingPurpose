import { Transform, Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

import {
  RequestType,
  IssuePriority,
  IssueCategory,
  SuppliesCategory,
} from '@prisma/client';

// Nested DTO for ISSUE type requests
export class IssueDetailsDto {
  @IsEnum(IssuePriority)
  priority: IssuePriority;

  @IsEnum(IssueCategory)
  category: IssueCategory;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  otherCategoryDetails?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  location?: string | null;
}

// Nested DTO for SUPPLIES type requests
export class SuppliesDetailsDto {
  @IsEnum(SuppliesCategory)
  category: SuppliesCategory;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  otherCategoryDetails?: string | null;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  itemName: string;
}

// Main DTO for creating a request
export class CreateRequestDto {
  @IsEnum(RequestType)
  type: RequestType; // "ISSUE" | "SUPPLIES"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  isAnonymous?: boolean;

  // ISSUE-specific fields
  @ValidateNested()
  @Type(() => IssueDetailsDto)
  @IsOptional()
  issueDetails?: IssueDetailsDto;

  // SUPPLIES-specific fields
  @ValidateNested()
  @Type(() => SuppliesDetailsDto)
  @IsOptional()
  suppliesDetails?: SuppliesDetailsDto;
}
