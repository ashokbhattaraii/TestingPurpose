import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus, RequestType, IssuePriority, IssueCategory, SuppliesCategory } from '@prisma/client';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) { }
  private removeNullish<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((v) => this.removeNullish(v)) as T;
    }

    if (value instanceof Date) {
      // ← add this
      return value;
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
        type: dto.type as RequestType,
        title: dto.title,
        description: dto.description ?? '',
        attachments: dto.attachments ?? [],
        status: 'PENDING' as RequestStatus,
        issueDetails:
          dto.type === RequestType.ISSUE
            ? {
              create: {
                priority: dto.issueDetails!.priority as IssuePriority,
                category: dto.issueDetails!
                  .category as unknown as IssueCategory,
                location: dto.issueDetails!.location,
              },
            }
            : undefined,
        suppliesDetails:
          dto.type === RequestType.SUPPLIES
            ? {
              create: {
                category: dto.suppliesDetails!
                  .category as SuppliesCategory,
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
  async getRequestById(id: string) {
    if (!id) {
      throw new BadRequestException('Request ID is required');
    }
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    if (!request) {
      throw new BadRequestException('Request not found');
    }
    return this.removeNullish({
      message: 'Request fetched successfully',
      request,
    });
  }

  async updateRequest(id: string, userId: string, dto: UpdateRequestDto) {
    const existing = await this.prisma.request.findUnique({
      where: { id },
      include: { issueDetails: true, suppliesDetails: true },
    });
    if (!existing) {
      throw new BadRequestException('Request not found');
    }
    if (existing.userId !== userId) {
      throw new BadRequestException('Not authorized to update this request');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING requests can be edited');
    }

    // Determine type for relations logic
    const newType = dto.type ?? existing.type;

    const request = await this.prisma.request.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description !== undefined ? dto.description : existing.description,
        type: newType,
        attachments: dto.attachments ?? existing.attachments,
        issueDetails:
          newType === RequestType.ISSUE
            ? {
              upsert: {
                create: {
                  priority:
                    (dto.issueDetails?.priority as IssuePriority) || IssuePriority.MEDIUM,
                  category:
                    (dto.issueDetails?.category as unknown as IssueCategory) ||
                    'TECHNICAL',
                  location: dto.issueDetails?.location || null,
                },
                update: {
                  priority: dto.issueDetails?.priority as IssuePriority,
                  category: dto.issueDetails?.category as unknown as IssueCategory,
                  location: dto.issueDetails?.location,
                },
              },
            }
            : existing.issueDetails
              ? { delete: true }
              : undefined,
        suppliesDetails:
          newType === RequestType.SUPPLIES
            ? {
              upsert: {
                create: {
                  category:
                    (dto.suppliesDetails?.category as SuppliesCategory) ||
                    'OFFICE_SUPPLIES',
                  itemName: dto.suppliesDetails?.itemName || '',
                },
                update: {
                  category: dto.suppliesDetails?.category as SuppliesCategory,
                  itemName: dto.suppliesDetails?.itemName,
                },
              },
            }
            : existing.suppliesDetails
              ? { delete: true }
              : undefined,
      },
      include: {
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

    return this.removeNullish({
      message: 'Request updated successfully',
      request,
    });
  }

  async updateRequestStatus(id: string, dto: UpdateRequestStatusDto) {
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        adminNotes: dto.adminNotes,
        approvedAt: (dto.status === 'RESOLVED' || dto.status === 'FULFILLED') ? new Date() : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,

          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    return {
      message: 'Status updated successfully',
      request,
    };
  }

  async assignRequest(id: string, dto: AssignRequestDto) {
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        approverId: dto.assignedToId,
        status: 'IN_PROGRESS' as RequestStatus,
      },
      include: {
        user: true,
        approver: true,
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    return {
      message: 'Request assigned successfully',
      request,
    };
  }

  async reopenRequest(id: string) {
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'PENDING' as RequestStatus,
        rejectionReason: null,
        approverId: null,
        approvedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    return {
      message: 'Request reopened successfully',
      request,
    };
  }

  async deleteRequest(id: string) {
    await this.prisma.request.delete({
      where: { id },
    });
    return {
      message: 'Request deleted successfully',
    };
  }
}
