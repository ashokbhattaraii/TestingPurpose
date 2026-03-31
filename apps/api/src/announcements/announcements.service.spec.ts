import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

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
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('notificationService should be defined', () => {
    expect(notificationService).toBeDefined();
  });

  describe('createAnnouncement', () => {
    const announcementData = {
      title: 'New Announcement',
      content: 'This is announcement content',
      priority: 'high',
      pinned: true,
      expiresAt: '2025-12-31',
    };

    it('should create announcement with all fields', async () => {
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce(
        mockAnnouncement,
      );

      const result = await service.createAnnouncement(
        announcementData,
        'user-1',
      );

      expect(prismaService.announcement.create).toHaveBeenCalledWith({
        data: {
          title: announcementData.title,
          content: announcementData.content,
          priority: announcementData.priority,
          pinned: announcementData.pinned,
          createdById: 'user-1',
          expiresAt: new Date(announcementData.expiresAt),
          isPublished: true,
        },
      });

      expect(result).toEqual(mockAnnouncement);
    });

    it('should create announcement with default values when not provided', async () => {
      const minimalData = {
        title: 'Minimal Announcement',
        content: 'Content',
      };

      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce({
        ...mockAnnouncement,
        ...minimalData,
      });

      await service.createAnnouncement(minimalData, 'user-1');

      expect(prismaService.announcement.create).toHaveBeenCalledWith({
        data: {
          title: minimalData.title,
          content: minimalData.content,
          priority: 'normal',
          pinned: false,
          createdById: 'user-1',
          expiresAt: null,
          isPublished: true,
        },
      });
    });

    it('should notify all users about new announcement', async () => {
      const shortContent = 'Short content';
      const dataWithShortContent = {
        title: 'Title',
        content: shortContent,
      };

      const returnedAnnouncement = {
        ...mockAnnouncement,
        title: dataWithShortContent.title,
        content: dataWithShortContent.content,
      };

      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce(
        returnedAnnouncement,
      );
      (notificationService.notifyAllUsers as jest.Mock).mockResolvedValueOnce([]);

      await service.createAnnouncement(dataWithShortContent, 'user-1');

      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(
        NotificationType.ANNOUNCEMENT,
        expect.stringContaining('Title'),
        expect.stringContaining(shortContent),
        '/dashboard/announcements',
      );
    });

    it('should truncate long content in notification', async () => {
      const longContent = 'a'.repeat(150);
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce({
        ...mockAnnouncement,
        content: longContent,
      });

      const dataWithLongContent = {
        title: 'Title',
        content: longContent,
      };

      await service.createAnnouncement(dataWithLongContent, 'user-1');

      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(
        NotificationType.ANNOUNCEMENT,
        expect.any(String),
        expect.stringContaining('...'),
        '/dashboard/announcements',
      );
    });

    it('should handle announcement creation error', async () => {
      const error = new Error('Database error');
      (prismaService.announcement.create as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        service.createAnnouncement(announcementData, 'user-1'),
      ).rejects.toThrow(error);
    });

    it('should set isPublished to true always', async () => {
      (prismaService.announcement.create as jest.Mock).mockResolvedValueOnce(
        mockAnnouncement,
      );

      const dataWithPublishFlag = {
        title: 'Title',
        content: 'Content',
        isPublished: false, // This should be ignored
      };

      await service.createAnnouncement(dataWithPublishFlag, 'user-1');

      const callArgs = (
        prismaService.announcement.create as jest.Mock
      ).mock.calls[0][0];
      expect(callArgs.data.isPublished).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all announcements sorted by pin and date', async () => {
      const announcements = [
        { ...mockAnnouncement, pinned: true },
        { ...mockAnnouncement, id: '2', pinned: false },
      ];

      (prismaService.announcement.findMany as jest.Mock).mockResolvedValueOnce(
        announcements,
      );

      const result = await service.findAll();

      expect(prismaService.announcement.findMany).toHaveBeenCalledWith({
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdBy: {
            select: { name: true },
          },
        },
      });

      expect(result).toEqual(announcements);
    });

    it('should return empty array when no announcements exist', async () => {
      (prismaService.announcement.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should include creator name in result', async () => {
      const announcementWithCreator = {
        ...mockAnnouncement,
        createdBy: { name: 'Admin User' },
      };

      (prismaService.announcement.findMany as jest.Mock).mockResolvedValueOnce([
        announcementWithCreator,
      ]);

      const result = await service.findAll();

      expect(result[0].createdBy.name).toBe('Admin User');
    });

    it('should handle database error', async () => {
      const error = new Error('Query error');
      (prismaService.announcement.findMany as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(service.findAll()).rejects.toThrow(error);
    });

    it('should order pinned announcements first', async () => {
      (prismaService.announcement.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await service.findAll();

      const callArgs = (
        prismaService.announcement.findMany as jest.Mock
      ).mock.calls[0][0];
      expect(callArgs.orderBy[0]).toEqual({ pinned: 'desc' });
      expect(callArgs.orderBy[1]).toEqual({ createdAt: 'desc' });
    });
  });

  describe('togglePin', () => {
    it('should toggle pin status to true', async () => {
      const pinnedAnnouncement = { ...mockAnnouncement, pinned: true };
      (prismaService.announcement.update as jest.Mock).mockResolvedValueOnce(
        pinnedAnnouncement,
      );

      const result = await service.togglePin('1', true);

      expect(prismaService.announcement.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { pinned: true },
      });

      expect(result.pinned).toBe(true);
    });

    it('should toggle pin status to false', async () => {
      const unpinnedAnnouncement = { ...mockAnnouncement, pinned: false };
      (prismaService.announcement.update as jest.Mock).mockResolvedValueOnce(
        unpinnedAnnouncement,
      );

      const result = await service.togglePin('1', false);

      expect(prismaService.announcement.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { pinned: false },
      });

      expect(result.pinned).toBe(false);
    });

    it('should handle toggle for non-existing announcement', async () => {
      const error = new Error('Not found');
      (prismaService.announcement.update as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(service.togglePin('invalid-id', true)).rejects.toThrow(
        error,
      );
    });

    it('should update only the pinned field', async () => {
      (prismaService.announcement.update as jest.Mock).mockResolvedValueOnce(
        mockAnnouncement,
      );

      await service.togglePin('1', true);

      const callArgs = (
        prismaService.announcement.update as jest.Mock
      ).mock.calls[0][0];
      expect(Object.keys(callArgs.data)).toEqual(['pinned']);
    });

    it('should handle database error gracefully', async () => {
      const error = new Error('Update failed');
      (prismaService.announcement.update as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(service.togglePin('1', true)).rejects.toThrow(
        'Update failed',
      );
    });
  });
});
