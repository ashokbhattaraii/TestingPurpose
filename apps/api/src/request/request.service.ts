import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

import { RequestType, RequestStatus } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, dto: CreateRequestDto) {
    if (dto.type === RequestType.ISSUE) {
      if (!dto.issueCategory || !dto.issuePriority) {
        throw new BadRequestException(
          'Issue Category and Priority is required',
        );
      }
    }
    if (dto.type === RequestType.Supplies) {
      if (!dto.suppliesCategory) {
        throw new BadRequestException('Supplies categories is required');
      }
    }

    return this.prisma.request.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        description: dto.description || '',
        attachments: dto.attachments,
        issuePriority: dto.issuePriority,
        issueCategory: dto.issueCategory,
        location: dto.location,
        SuppliesCategory: dto.suppliesCategory,
        itemName: dto.itemName,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getUserRequests(userId: string) {
    return this.prisma.request.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
