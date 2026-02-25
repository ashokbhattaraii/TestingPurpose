import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { $Enums } from '@prisma/client';

enum RequestType {
  ISSUE = 'ISSUE',
  SUPPLIES = 'SUPPLIES',
}
enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
enum IssueCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
}
enum SuppliesCategory {
  OFFICE = 'OFFICE',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}
@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  private removeNullish<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((v) => this.removeNullish(v)) as T;
    }

    if (value && typeof value === 'object') {
      const cleaned = Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, this.removeNullish(v)]),
      );
      return cleaned as T;
    }

    return value;
  }

  async createRequest(userId: string, dto: CreateRequestDto) {
    // Validate the DTO
    if (dto.type === RequestType.ISSUE && !dto.issueDetails) {
      throw new BadRequestException(
        'Issue details required for ISSUE type requests',
      );
    }
    if (dto.type === RequestType.SUPPLIES && !dto.suppliesDetails) {
      throw new BadRequestException(
        'Supplies details required for SUPPLIES type requests',
      );
    }

    // Nested creation works only with RequestCreateInput type
    const request = await this.prisma.request.create({
      data: {
        userId,
        type: dto.type as $Enums.RequestType,
        title: dto.title,
        description: dto.description ?? '',
        attachments: dto.attachments ?? [],
        status: 'PENDING' as const,
        issueDetails:
          dto.type === RequestType.ISSUE
            ? {
                create: {
                  priority: dto.issueDetails!.priority as $Enums.IssuePriority,
                  category: dto.issueDetails!
                    .category as unknown as $Enums.IssueCategory,
                  location: dto.issueDetails!.location,
                },
              }
            : undefined,
        suppliesDetails:
          dto.type === RequestType.SUPPLIES
            ? {
                create: {
                  category: dto.suppliesDetails!
                    .category as $Enums.SuppliesCategory,
                  itemName: dto.suppliesDetails!.itemName,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true,
        title: true,
        description: true,
        attachments: true,
        approverId: true,
        approvedAt: true,
        rejectionReason: true,
        adminNotes: true,
        isFulfilled: true,
        fulfilledAt: true,
        fulfilledBy: true,
        createdAt: true, // keep
        // updatedAt: false (simply omitted)
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            photoURL: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    const returnMsg = {
      message: 'Request created successfully',
      request,
    };
    return this.removeNullish(returnMsg);
  }

  async getRequests() {
    const requests = await this.prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        issueDetails: true,
        suppliesDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            photoURL: true,
          },
        },
      },
    });
    const returnMsg = {
      message: 'Total requests fetched successfully',
      requests,
    };
    return this.removeNullish(returnMsg);
  }
}
