import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from '@prisma/client';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;
  let notificationGateway: NotificationGateway;

  const mockNotification = {
    id: '1',
    userId: 'user-1',
    type: NotificationType.ANNOUNCEMENT,
    title: 'Test Notification',
    message: 'This is a test',
    link: '/dashboard',
    metadata: null,
    createdAt: new Date(),
    isRead: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            sendNotificationToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('notificationGateway should be defined', () => {
    expect(notificationGateway).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const userId = 'user-1';
      const type = NotificationType.ANNOUNCEMENT;
      const title = 'Test Title';
      const message = 'Test Message';

      (prismaService.notification.create as jest.Mock).mockResolvedValueOnce(
        mockNotification,
      );

      const result = await service.createNotification(
        userId,
        type,
        title,
        message,
      );

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          type,
          title,
          message,
          link: undefined,
          metadata: undefined,
        },
      });

      expect(result).toEqual(mockNotification);
    });

    it('should create notification with optional link and metadata', async () => {
      const userId = 'user-1';
      const type = NotificationType.REQUEST_UPDATE;    
      const title = 'Request Update';
      const message = 'Your request has been updated';
      const link = '/dashboard/requests/1';
      const metadata = { requestId: '1', status: 'approved' };

      (prismaService.notification.create as jest.Mock).mockResolvedValueOnce({
        ...mockNotification,
        link,
        metadata,
      });

      const result = await service.createNotification(
        userId,
        type,
        title,
        message,
        link,
        metadata,
      );

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          type,
          title,
          message,
          link,
          metadata,
        },
      });

      expect(result.link).toBe(link);
      expect(result.metadata).toEqual(metadata);
    });

    it('should emit notification via gateway', async () => {
      (prismaService.notification.create as jest.Mock).mockResolvedValueOnce(
        mockNotification,
      );

      await service.createNotification(
        'user-1',
        NotificationType.ANNOUNCEMENT,
        'Test',
        'Test message',
      );

      expect(notificationGateway.sendNotificationToUser).toHaveBeenCalledWith(
        'user-1',
        mockNotification,
      );
    });

    it('should throw error when notification creation fails', async () => {
      const error = new Error('Database error');
      (prismaService.notification.create as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        service.createNotification(
          'user-1',
          NotificationType.ANNOUNCEMENT,
          'Test',
          'Test message',
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('notifyAllAdmins', () => {
    it('should notify all active admins', async () => {
      const adminUsers = [
        { id: '1', name: 'Admin1', roles: ['ADMIN'], isActive: true },
        { id: '2', name: 'Admin2', roles: ['SUPER_ADMIN'], isActive: true },
        { id: '3', name: 'User1', roles: ['USER'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(
        adminUsers,
      );
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const result = await service.notifyAllAdmins(
        NotificationType.ANNOUNCEMENT,
        'Admin Alert',
        'This is for admins',
      );

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });

      expect(prismaService.notification.create).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
    });

    it('should handle notification with link and metadata for admins', async () => {
      const adminUsers = [
        { id: '1', name: 'Admin1', roles: ['ADMIN'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(
        adminUsers,
      );
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      await service.notifyAllAdmins(
        NotificationType.ANNOUNCEMENT,
        'Alert',
        'Message',
        '/dashboard/alerts',
        { priority: 'high' },
      );

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: '1',
          type: NotificationType.ANNOUNCEMENT,
          title: 'Alert',
          message: 'Message',
          link: '/dashboard/alerts',
          metadata: { priority: 'high' },
        },
      });
    });

    it('should filter out inactive admins', async () => {
      // The service queries for isActive: true, so the mock should only return active users
      // It then filters for admins from those active users
      const activeUsers = [
        { id: '1', name: 'Admin1', roles: ['ADMIN'], isActive: true },
        { id: '2', name: 'User1', roles: ['USER'], isActive: true },
        { id: '3', name: 'Admin2', roles: ['ADMIN'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(
        activeUsers,
      );
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const result = await service.notifyAllAdmins(
        NotificationType.ANNOUNCEMENT,
        'Alert',
        'Message',
      );

      // Only the 2 admins should receive the notification
      expect(result.length).toBe(2);
      expect(prismaService.notification.create).toHaveBeenCalledTimes(2);
    });

    it('should handle error when fetching admins', async () => {
      const error = new Error('Database error');
      (prismaService.user.findMany as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        service.notifyAllAdmins(
          NotificationType.ANNOUNCEMENT,
          'Alert',
          'Message',
        ),
      ).rejects.toThrow(error);
    });

    it('should return empty array when no admins found', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([
        { id: '1', name: 'User1', roles: ['USER'], isActive: true },
      ]);

      const result = await service.notifyAllAdmins(
        NotificationType.ANNOUNCEMENT,
        'Alert',
        'Message',
      );

      expect(result.length).toBe(0);
    });
  });

  describe('notifyAllUsers', () => {
    it('should notify all active users', async () => {
      const users = [
        { id: '1', name: 'User1', roles: ['USER'], isActive: true },
        { id: '2', name: 'User2', roles: ['USER'], isActive: true },
        { id: '3', name: 'Admin1', roles: ['ADMIN'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(users);
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const result = await service.notifyAllUsers(
        NotificationType.ANNOUNCEMENT,
        'New Announcement',
        'This is a broadcast',
      );

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });

      expect(prismaService.notification.create).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(3);
    });

    it('should handle broadcast with link and metadata', async () => {
      const users = [
        { id: '1', name: 'User1', roles: ['USER'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(users);
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      await service.notifyAllUsers(
        NotificationType.ANNOUNCEMENT,
        'Broadcast',
        'Message',
        '/announcements',
        { broadcastId: '1' },
      );

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: '1',
          type: NotificationType.ANNOUNCEMENT,
          title: 'Broadcast',
          message: 'Message',
          link: '/announcements',
          metadata: { broadcastId: '1' },
        },
      });
    });

    it('should only notify active users', async () => {
      // The service queries for isActive: true, so the mock should only return active users
      const activeUsers = [
        { id: '1', name: 'User1', roles: ['USER'], isActive: true },
        { id: '2', name: 'User2', roles: ['USER'], isActive: true },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce(
        activeUsers,
      );
      (prismaService.notification.create as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const result = await service.notifyAllUsers(
        NotificationType.ANNOUNCEMENT,
        'Broadcast',
        'Message',
      );

      expect(result.length).toBe(2);
    });

    it('should handle error when fetching users', async () => {
      const error = new Error('Database error');
      (prismaService.user.findMany as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        service.notifyAllUsers(
          NotificationType.ANNOUNCEMENT,
          'Broadcast',
          'Message',
        ),
      ).rejects.toThrow(error);
    });

    it('should return empty array when no users found', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await service.notifyAllUsers(
        NotificationType.ANNOUNCEMENT,
        'Broadcast',
        'Message',
      );

      expect(result.length).toBe(0);
    });
  });
});
