import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
          metadata,
        },
      });

      // Emit the notification via WebSocket
      this.notificationGateway.sendNotificationToUser(userId, notification);

      this.logger.log(
        `Notification created and emitted for user ${userId}: ${title}`,
      );
      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  async notifyAllAdmins(
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ) {
    try {
      // Fetch all users who have at least one role containing 'ADMIN'
      const allUsers = await this.prisma.user.findMany({
        where: { isActive: true },
      });

      const admins = allUsers.filter((user) =>
        user.roles.some((role) => role.toUpperCase().includes('ADMIN')),
      );

      const notifications = await Promise.all(
        admins.map((admin) =>
          this.createNotification(
            admin.id,
            type,
            title,
            message,
            link,
            metadata,
          ),
        ),
      );

      this.logger.log(`Notification sent to ${admins.length} admins: ${title}`);
      return notifications;
    } catch (error) {
      this.logger.error('Failed to notify admins', error);
      throw error;
    }
  }

  async notifyAllUsers(
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ) {
    try {
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
      });

      const notifications = await Promise.all(
        users.map((user) =>
          this.createNotification(
            user.id,
            type,
            title,
            message,
            link,
            metadata,
          ),
        ),
      );

      this.logger.log(`Notification sent to ${users.length} users: ${title}`);
      return notifications;
    } catch (error) {
      this.logger.error('Failed to notify all users', error);
      throw error;
    }
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
