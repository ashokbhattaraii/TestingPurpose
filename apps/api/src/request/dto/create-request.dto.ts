import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

// Enums
export enum RequestType {
  ISSUE = 'ISSUE',
  SUPPLIES = 'SUPPLIES',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum IssueCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
}

export enum SuppliesCategory {
  OFFICE = 'OFFICE',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

// Nested DTO for ISSUE type requests
export class IssueDetailsDto {
  @IsEnum(IssuePriority)
  priority: IssuePriority;

  @IsEnum(IssueCategory)
  category: IssueCategory;

  @IsOptional()
  @IsString()
  location?: string | null;
}

// Nested DTO for SUPPLIES type requests
export class SuppliesDetailsDto {
  @IsEnum(SuppliesCategory)
  category: SuppliesCategory;

  @IsString()
  @IsNotEmpty()
  itemName: string;
}

// Main DTO for creating a request
export class CreateRequestDto {
  @IsEnum(RequestType)
  type: RequestType; // "ISSUE" | "SUPPLIES"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  attachments?: string[];

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
