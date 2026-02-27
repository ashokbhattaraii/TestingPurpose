import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async createAnnouncement(data: any, userId: string) {
    return (this.prisma as any).announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority || 'normal',
        createdById: userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isPublished: true,
      },
    });
  }

  async findAll() {
    return (this.prisma as any).announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });
  }
}