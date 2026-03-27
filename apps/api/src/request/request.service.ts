import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import {
  RequestStatus,
  RequestType,
  IssuePriority,
  IssueCategory,
  SuppliesCategory,
} from '@prisma/client';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) { }
  private formatRequestDetails(request: any) {
    if (!request) return request;
    const result = { ...request };

    if (result.user) {
      result.user = {
        id: result.user.id,
        name: result.user.name,
        photoURL: result.user.photoURL,
        isAdmin: Array.isArray(result.user.roles)
          ? result.user.roles.some((r: string) => r.toLowerCase().includes('admin'))
          : false,
      };
    }

    if (result.approver) {
      result.approver = {
        name: result.approver.name,
        photoURL: result.approver.photoURL,
        isAdmin: Array.isArray(result.approver.roles)
          ? result.approver.roles.some((r: string) => r.toLowerCase().includes('admin'))
          : false,
      };
    }

    if (result.issueDetails) {
      delete result.issueDetails.requestId;
      delete result.issueDetails.id;
    }

    if (result.suppliesDetails) {
      delete result.suppliesDetails.requestId;
      delete result.suppliesDetails.id;
    }

    return result;
  }

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
        type: dto.type,
        title: dto.title,
        description: dto.description ?? '',
        status: 'PENDING' as RequestStatus,
        issueDetails:
          dto.type === RequestType.ISSUE
            ? {
              create: {
                priority: dto.issueDetails!.priority,
                category: dto.issueDetails!
                  .category as unknown as IssueCategory,
                location: dto.issueDetails!.location,
                otherCategoryDetails: dto.issueDetails!.otherCategoryDetails,
              },
            }
            : undefined,
        suppliesDetails:
          dto.type === RequestType.SUPPLIES
            ? {
              create: {
                category: dto.suppliesDetails!.category,
                itemName: dto.suppliesDetails!.itemName,
                otherCategoryDetails:
                  dto.suppliesDetails!.otherCategoryDetails,
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
        approverId: true,
        approvedAt: true,
        rejectionReason: true,
        adminNotes: true,
        createdAt: true, // keep
        updatedAt: true, // keep
        // updatedAt: false (simply omitted)
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
            photoURL: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });

    // Notify Admins about the new request
    await this.notificationService.notifyAllAdmins(
      NotificationType.REQUEST_UPDATE,
      'New Request Created',
      `New request created by ${request.user.name}`,
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    const returnMsg = {
      message: 'Request created successfully',
      request: this.formatRequestDetails(request),
    };
    return this.removeNullish(returnMsg);
  }

  async getRequests(options?: { userId?: string; roles?: string[]; currentUserId?: string }) {
    const roles = options?.roles ?? [];
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN');

    const requestedUserId = options?.userId;
    let effectiveUserId: string | undefined;

    if (requestedUserId) {
      // Admins can filter by any user; non-admins can only filter to themselves
      effectiveUserId = isAdmin || requestedUserId === options?.currentUserId
        ? requestedUserId
        : options?.currentUserId;
    } else {
      // No userId provided: return all requests (used by Service Requests page)
      effectiveUserId = undefined;
    }

    const requests = await this.prisma.request.findMany({
      where: effectiveUserId ? { userId: effectiveUserId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        issueDetails: true,
        suppliesDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
            photoURL: true,
          },
        },
      },
    });
    const returnMsg = {
      message: 'Total requests fetched successfully',
      requests: requests.map(r => this.formatRequestDetails(r)),
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
            roles: true,
            department: true,
            photoURL: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return this.removeNullish({
      message: 'Request fetched successfully',
      request: this.formatRequestDetails(request),
    });
  }

  async updateRequest(id: string, userId: string, dto: UpdateRequestDto) {
    const existing = await this.prisma.request.findUnique({
      where: { id },
      include: { issueDetails: true, suppliesDetails: true },
    });
    if (!existing) {
      throw new NotFoundException('Request not found');
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
        description:
          dto.description !== undefined
            ? dto.description
            : existing.description,
        type: newType,
        issueDetails:
          newType === RequestType.ISSUE
            ? {
              upsert: {
                create: {
                  priority:
                    (dto.issueDetails?.priority as IssuePriority) ||
                    IssuePriority.MEDIUM,
                  category:
                    (dto.issueDetails
                      ?.category as unknown as IssueCategory) || 'TECHNICAL',
                  location: dto.issueDetails?.location || null,
                  otherCategoryDetails:
                    dto.issueDetails?.otherCategoryDetails || null,
                },
                update: {
                  priority: dto.issueDetails?.priority as IssuePriority,
                  category: dto.issueDetails
                    ?.category as unknown as IssueCategory,
                  location: dto.issueDetails?.location,
                  otherCategoryDetails:
                    dto.issueDetails?.otherCategoryDetails,
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
                  otherCategoryDetails:
                    dto.suppliesDetails?.otherCategoryDetails || null,
                },
                update: {
                  category: dto.suppliesDetails?.category as SuppliesCategory,
                  itemName: dto.suppliesDetails?.itemName,
                  otherCategoryDetails:
                    dto.suppliesDetails?.otherCategoryDetails,
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
            roles: true,
            department: true,
            photoURL: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });

    this.notificationGateway.broadcastRequestUpdate();

    return this.removeNullish({
      message: 'Request updated successfully',
      request: this.formatRequestDetails(request),
    });
  }

  async updateRequestStatus(
    id: string,
    adminId: string,
    dto: UpdateRequestStatusDto,
  ) {
    const existing = await this.prisma.request.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Request not found');
    }
    if (existing.userId === adminId) {
      throw new BadRequestException(
        'You cannot update the status of your own request',
      );
    }
    // If the request is assigned to a specific admin, only that admin can update it
    if (existing.approverId && existing.approverId !== adminId) {
      throw new BadRequestException(
        'This request is assigned to another admin. Only the assigned admin can update it.',
      );
    }

    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        adminNotes: dto.adminNotes,
        approvedAt:
          dto.status === 'RESOLVED'
            ? new Date()
            : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });

    // Notify the user who created the request about the status change
    await this.notificationService.createNotification(
      request.userId,
      NotificationType.REQUEST_UPDATE,
      'Request Status Updated',
      `Your request "${request.title}" status has been changed to ${request.status}.`,
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    return {
      message: 'Status updated successfully',
      request: this.formatRequestDetails(request),
    };
  }

  async assignRequest(id: string, adminId: string, dto: AssignRequestDto) {
    const existing = await this.prisma.request.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Request not found');
    }
    if (existing.userId === adminId) {
      throw new BadRequestException('You cannot assign your own request');
    }
    if (existing.userId === dto.assignedToId) {
      throw new BadRequestException(
        'You cannot assign a request to its creator',
      );
    }
    // If already assigned to another admin, prevent reassignment by non-assigned admins
    if (existing.approverId && existing.approverId !== adminId) {
      throw new BadRequestException(
        'This request is already assigned to another admin. Only the assigned admin can reassign it.',
      );
    }

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

    // Notify the assignee (only the specific admin they were assigned to)
    await this.notificationService.createNotification(
      request.approverId!,
      NotificationType.REQUEST_UPDATE,
      'New Request Assigned',
      `You have been assigned to the request: "${request.title}"`,
      `/requests/${request.id}`,
    );

    // Note: Removed general admin notification and requester notification here
    // to strictly follow the 'only notify respective admin' instruction.

    this.notificationGateway.broadcastRequestUpdate();

    return {
      message: 'Request assigned successfully',
      request: this.formatRequestDetails(request),
    };
  }

  async reopenRequest(id: string) {
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'PENDING' as RequestStatus,
        rejectionReason: null,
        approvedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    // Notify the requester that their request has been reopened
    await this.notificationService.createNotification(
      request.userId,
      NotificationType.REQUEST_UPDATE,
      'Request Reopened',
      `Your request "${request.title}" has been reopened and is back in PENDING status.`,
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    return {
      message: 'Request reopened successfully',
      request: this.formatRequestDetails(request),
    };
  }

  async cancelRequest(id: string) {
    const existingRequest = await this.prisma.request.findUnique({
      where: { id: id },
    });
    if (!existingRequest) {
      throw new NotFoundException('Request not found');
    }
    const request = await this.prisma.request.update({
      where: { id: id },
      data: {
        status: 'CANCELLED' as RequestStatus,
        rejectionReason: 'Cancelled by user',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true,
            department: true,
          },
        },
        issueDetails: true,
        suppliesDetails: true,
      },
    });

    // Notify the requester about cancellation (if done by someone else, but good to have anyway)
    await this.notificationService.createNotification(
      request.userId,
      NotificationType.REQUEST_UPDATE,
      'Request Cancelled',
      `The request "${request.title}" has been cancelled.`,
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    return {
      message: 'Request cancelled successfully',
      request: this.formatRequestDetails(request),
    };
  }
}
