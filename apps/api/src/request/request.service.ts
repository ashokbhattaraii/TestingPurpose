import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import {
  RequestStatus,
  RequestType,
  IssuePriority,
  IssueCategory,
  SuppliesCategory,
  NotificationType,
} from '@prisma/client';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

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

    // ERROR FIX: isAnonymous check using casting to avoid TS error if column missing in DB
    if ((result as any).isAnonymous) {
      result.user = {
        id: 'anonymous',
        name: 'Anonymous',
        email: 'anonymous',
        roles: [],
        department: null,
        photoURL: null,
        isAdmin: false,
      };
    } else if (result.user) {
      result.user = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        roles: result.user.roles,
        department: result.user.department,
        photoURL: result.user.photoURL,
        isAdmin: Array.isArray(result.user.roles)
          ? result.user.roles.some((r: string) => r.toLowerCase().includes('admin'))
          : false,
      };
    }

    if (result.approver) {
      result.approver = {
        id: result.approver.id,
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
    if (value instanceof Date) return value;
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
    if (dto.type === RequestType.ISSUE && !dto.issueDetails) {
      throw new BadRequestException('Issue details required for ISSUE type requests');
    }
    if (dto.type === RequestType.SUPPLIES && !dto.suppliesDetails) {
      throw new BadRequestException('Supplies details required for SUPPLIES type requests');
    }

    // Prepare data object - Casting to 'any' to bypass TS errors temporarily 
    // until 'npx prisma generate' is run with updated schema
    const createData: any = {
      userId,
      type: dto.type,
      title: dto.title,
      description: dto.description ?? '',
      isAnonymous: dto.isAnonymous ?? false, // ERROR FIX 119
      status: 'PENDING' as RequestStatus,
      issueDetails: dto.type === RequestType.ISSUE ? {
        create: {
          priority: dto.issueDetails!.priority,
          category: dto.issueDetails!.category as unknown as IssueCategory,
          location: dto.issueDetails!.location,
          otherCategoryDetails: dto.issueDetails!.otherCategoryDetails,
        },
      } : undefined,
      suppliesDetails: dto.type === RequestType.SUPPLIES ? {
        create: {
          category: dto.suppliesDetails!.category,
          itemName: dto.suppliesDetails!.itemName,
          otherCategoryDetails: dto.suppliesDetails!.otherCategoryDetails,
        },
      } : undefined,
    };

    const request = await this.prisma.request.create({
      data: createData,
      include: {
        user: true, // ERROR FIX 179: Ensure user is included
        issueDetails: true,
        suppliesDetails: true,
      },
    });

    await this.notificationService.notifyAllAdmins(
      NotificationType.REQUEST_UPDATE,
      'New Request Created',
      `New request created by ${request.user?.name || 'Anonymous'}`, // Safe access
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    return this.removeNullish({
      message: 'Request created successfully',
      request: this.formatRequestDetails(request),
    });
  }

  async getRequests(options?: { userId?: string; roles?: string[]; currentUserId?: string }) {
    const roles = options?.roles ?? [];
    const isAdmin = roles.includes('ADMIN');
    const requestedUserId = options?.userId;
    let effectiveUserId: string | undefined;

    if (requestedUserId) {
      effectiveUserId = isAdmin || requestedUserId === options?.currentUserId
        ? requestedUserId
        : options?.currentUserId;
    }

    const requests = await this.prisma.request.findMany({
      where: effectiveUserId ? { userId: effectiveUserId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        issueDetails: true,
        suppliesDetails: true,
        user: true,
      },
    });
    
    return this.removeNullish({
      message: 'Total requests fetched successfully',
      requests: requests.map(r => this.formatRequestDetails(r)),
    });
  }

  async getRequestById(id: string) {
    if (!id) throw new BadRequestException('Request ID is required');
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
        approver: true,
        issueDetails: true,
        suppliesDetails: true,
      },
    });
    if (!request) throw new NotFoundException('Request not found');
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
    if (!existing) throw new NotFoundException('Request not found');
    if (existing.userId !== userId) throw new BadRequestException('Not authorized');
    if (existing.status !== 'PENDING') throw new BadRequestException('Only PENDING requests can be edited');

    const newType = dto.type ?? existing.type;
    const updateData: any = {
      title: dto.title ?? existing.title,
      description: dto.description !== undefined ? dto.description : existing.description,
      isAnonymous: dto.isAnonymous ?? (existing as any).isAnonymous, // ERROR FIX 298
      type: newType,
      issueDetails: newType === RequestType.ISSUE ? {
        upsert: {
          create: {
            priority: dto.issueDetails?.priority || IssuePriority.MEDIUM,
            category: (dto.issueDetails?.category as unknown as IssueCategory) || 'TECHNICAL',
            location: dto.issueDetails?.location || null,
            otherCategoryDetails: dto.issueDetails?.otherCategoryDetails || null,
          },
          update: {
            priority: dto.issueDetails?.priority,
            category: dto.issueDetails?.category as unknown as IssueCategory,
            location: dto.issueDetails?.location,
            otherCategoryDetails: dto.issueDetails?.otherCategoryDetails,
          },
        },
      } : (existing.issueDetails ? { delete: true } : undefined),
      suppliesDetails: newType === RequestType.SUPPLIES ? {
        upsert: {
          create: {
            category: dto.suppliesDetails?.category || 'OFFICE_SUPPLIES',
            itemName: dto.suppliesDetails?.itemName || '',
            otherCategoryDetails: dto.suppliesDetails?.otherCategoryDetails || null,
          },
          update: {
            category: dto.suppliesDetails?.category,
            itemName: dto.suppliesDetails?.itemName,
            otherCategoryDetails: dto.suppliesDetails?.otherCategoryDetails,
          },
        },
      } : (existing.suppliesDetails ? { delete: true } : undefined),
    };

    const request = await this.prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
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

  async updateRequestStatus(id: string, adminId: string, dto: UpdateRequestStatusDto) {
    const existing = await this.prisma.request.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Request not found');
    if (existing.userId === adminId) throw new BadRequestException('Cannot update own request');
    if (existing.approverId && existing.approverId !== adminId) throw new BadRequestException('Assigned to another admin');

    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        adminNotes: dto.adminNotes,
        approvedAt: dto.status === 'RESOLVED' ? new Date() : undefined,
      },
      include: { user: true, issueDetails: true, suppliesDetails: true },
    });

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
    if (!existing) throw new NotFoundException('Request not found');
    if (existing.userId === adminId) throw new BadRequestException('Cannot assign own request');
    
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        approverId: dto.assignedToId,
        status: 'IN_PROGRESS' as RequestStatus,
      },
      include: { user: true, approver: true, issueDetails: true, suppliesDetails: true },
    });

    await this.notificationService.createNotification(
      request.approverId!,
      NotificationType.REQUEST_UPDATE,
      'New Request Assigned',
      `You have been assigned to the request: "${request.title}"`,
      `/requests/${request.id}`,
    );

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
      include: { user: true, issueDetails: true, suppliesDetails: true },
    });
    
    await this.notificationService.createNotification(
      request.userId,
      NotificationType.REQUEST_UPDATE,
      'Request Reopened',
      `Your request "${request.title}" has been reopened.`,
      `/requests/${request.id}`,
    );

    this.notificationGateway.broadcastRequestUpdate();

    return {
      message: 'Request reopened successfully',
      request: this.formatRequestDetails(request),
    };
  }

  async cancelRequest(id: string) {
    const existing = await this.prisma.request.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Request not found');
    
    const request = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'CANCELLED' as RequestStatus,
        rejectionReason: 'Cancelled by user',
      },
      include: { user: true, issueDetails: true, suppliesDetails: true },
    });

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