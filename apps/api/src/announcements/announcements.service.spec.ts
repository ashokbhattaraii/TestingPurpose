import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
import { NotificationGateway } from '../notification/notification.gateway';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;
  let notificationGateway: NotificationGateway;

  const mockAnnouncement = {
    id: '1',
    title: 'Test Announcement',
    content: 'This is a test announcement content',
    priority: 'normal',
    pinned: false,
    createdById: 'user-1',
    expiresAt: null,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        {
          provide: PrismaService,
          useValue: {
            announcement: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyAllUsers: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            // १. यहाँ यो फङ्सन थपिएको छ
            broadcastAnnouncementUpdate: jest.fn(),
            server: {
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnnouncement', () => {
    const announcementData = {
      title: 'New Announcement',
      content: 'This is announcement content',
      priority: 'high',
      pinned: true,
      expiresAt: '2025-12-31',
    };

    it('should create announcement and broadcast update', async () => {
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce(
        mockAnnouncement,
      );

      const result = await service.createAnnouncement(announcementData, 'user-1');

      expect(prismaService.announcement.create).toHaveBeenCalled();
      expect(notificationGateway.broadcastAnnouncementUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockAnnouncement);
    });

    it('should notify all users about new announcement', async () => {
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce(
        mockAnnouncement,
      );
      (notificationService.notifyAllUsers as jest.Mock).mockResolvedValueOnce([]);

      await service.createAnnouncement(announcementData, 'user-1');

      // २. यहाँ URL लाई '/announcements' मा बदलियो (ERROR यहाँ थियो)
      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(
        NotificationType.ANNOUNCEMENT,
        expect.any(String),
        expect.any(String),
        '/announcements', 
      );
    });

    it('should truncate long content in notification', async () => {
      const longContent = 'a'.repeat(150);
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce({
        ...mockAnnouncement,
        content: longContent,
      });

      await service.createAnnouncement({ ...announcementData, content: longContent }, 'user-1');

      // ३. यहाँ पनि URL मिलाइयो
      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(
        NotificationType.ANNOUNCEMENT,
        expect.any(String),
        expect.stringContaining('...'),
        '/announcements',
      );
    });

    it('should handle announcement creation error', async () => {
      (prismaService.announcement.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      await expect(service.createAnnouncement(announcementData, 'user-1')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      (prismaService.announcement.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('togglePin', () => {
    it('should toggle pin and broadcast', async () => {
      (prismaService.announcement.update as jest.Mock).mockResolvedValueOnce({
        ...mockAnnouncement,
        pinned: true,
      });

      const result = await service.togglePin('1', true);
      expect(notificationGateway.broadcastAnnouncementUpdate).toHaveBeenCalled();
      expect(result.pinned).toBe(true);
    });
  });
});