import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) { }

  async createAnnouncement(data: any, userId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority || 'normal',
        pinned: data.pinned || false,
        createdById: userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isPublished: true,
      },
    });

    // Notify all users about the new announcement
    await this.notificationService.notifyAllUsers(
      NotificationType.ANNOUNCEMENT,
      `📣 New Announcement: ${announcement.title}`,
      announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      `/announcements`,
    );

    this.notificationGateway.broadcastAnnouncementUpdate();

    return announcement;
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });
  }

  async togglePin(id: string, pinned: boolean) {
    const announcement = await this.prisma.announcement.update({
      where: { id },
      data: { pinned },
    });
    this.notificationGateway.broadcastAnnouncementUpdate();
    return announcement;
  }
}
