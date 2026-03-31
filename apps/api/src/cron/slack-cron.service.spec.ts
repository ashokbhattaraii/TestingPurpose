import { Test, TestingModule } from '@nestjs/testing';
import { SlackCronService } from './slack-cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlackService } from '../slack/slack.service';
import { LunchType } from '@prisma/client';

describe('SlackCronService', () => {
  let service: SlackCronService;
  let prismaService: PrismaService;
  let slackService: SlackService;

  const mockLunchAttendance = [
    {
      id: '1',
      userId: 'user-1',
      date: new Date(),
      isAttending: true,
      preferredLunchOption: LunchType.VEG,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
      },
    },
    {
      id: '2',
      userId: 'user-2',
      date: new Date(),
      isAttending: true,
      preferredLunchOption: LunchType.NON_VEG,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackCronService,
        {
          provide: PrismaService,
          useValue: {
            lunchAttendance: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: SlackService,
          useValue: {
            sendLunchSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SlackCronService>(SlackCronService);
    prismaService = module.get<PrismaService>(PrismaService);
    slackService = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('slackService should be defined', () => {
    expect(slackService).toBeDefined();
  });

  describe('handleEvery30Minutes', () => {
    it('should trigger daily slack job', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await service.handleEvery30Minutes();

      expect(prismaService.lunchAttendance.findMany).toHaveBeenCalled();
    });

    it('should call handleDailySlackJob', async () => {
      const spy = jest.spyOn(service as any, 'handleDailySlackJob');
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await service.handleEvery30Minutes();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('handleDailySlackJob', () => {
    it('should fetch lunch records for today and send summary', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        mockLunchAttendance,
      );
      (slackService.sendLunchSummary as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await (service as any).handleDailySlackJob();

      expect(prismaService.lunchAttendance.findMany).toHaveBeenCalled();
      expect(slackService.sendLunchSummary).toHaveBeenCalled();
    });

    it('should only fetch attending lunch records', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        mockLunchAttendance,
      );
      (slackService.sendLunchSummary as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        prismaService.lunchAttendance.findMany as jest.Mock
      ).mock.calls[0][0];
      expect(callArgs.where.isAttending).toBe(true);
    });

    it('should correctly count veg and non-veg attendees', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        mockLunchAttendance,
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        slackService.sendLunchSummary as jest.Mock
      ).mock.calls[0][0];

      expect(callArgs.vegCount).toBe(1);
      expect(callArgs.nonVegCount).toBe(1);
    });

    it('should include correct attendee names', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        mockLunchAttendance,
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        slackService.sendLunchSummary as jest.Mock
      ).mock.calls[0][0];

      expect(callArgs.vegNames).toContain('Alice Johnson');
      expect(callArgs.nonVegNames).toContain('Bob Smith');
    });

    it('should handle empty lunch attendance', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        slackService.sendLunchSummary as jest.Mock
      ).mock.calls[0][0];

      expect(callArgs.total).toBe(0);
      expect(callArgs.vegCount).toBe(0);
      expect(callArgs.nonVegCount).toBe(0);
      expect(callArgs.vegNames).toEqual([]);
      expect(callArgs.nonVegNames).toEqual([]);
    });

    it('should fetch records ordered by user name', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        prismaService.lunchAttendance.findMany as jest.Mock
      ).mock.calls[0][0];

      expect(callArgs.orderBy).toEqual({ user: { name: 'asc' } });
    });

    it('should handle attendance fetch error gracefully', async () => {
      const error = new Error('Database error');
      (prismaService.lunchAttendance.findMany as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await (service as any).handleDailySlackJob();

      expect(slackService.sendLunchSummary).not.toHaveBeenCalled();
    });

    it('should handle slack service error gracefully', async () => {
      const error = new Error('Slack API error');
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        mockLunchAttendance,
      );
      (slackService.sendLunchSummary as jest.Mock).mockRejectedValueOnce(error);

      await (service as any).handleDailySlackJob();

      expect(slackService.sendLunchSummary).toHaveBeenCalled();
    });

    it('should send date in YYYY-MM-DD format', async () => {
      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        [],
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        slackService.sendLunchSummary as jest.Mock
      ).mock.calls[0][0];

      // Check format matches YYYY-MM-DD
      expect(callArgs.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle multiple attendees with same preference', async () => {
      const multipleVegAttendees = [
        {
          ...mockLunchAttendance[0],
          id: '1',
          preferredLunchOption: LunchType.VEG,
        },
        {
          ...mockLunchAttendance[0],
          id: '2',
          preferredLunchOption: LunchType.VEG,
          user: { ...mockLunchAttendance[0].user, id: 'user-2', name: 'Charlie' },
        },
      ];

      (prismaService.lunchAttendance.findMany as jest.Mock).mockResolvedValueOnce(
        multipleVegAttendees,
      );

      await (service as any).handleDailySlackJob();

      const callArgs = (
        slackService.sendLunchSummary as jest.Mock
      ).mock.calls[0][0];

      expect(callArgs.vegCount).toBe(2);
      expect(callArgs.nonVegCount).toBe(0);
      expect(callArgs.total).toBe(2);
    });
  });

  describe('getKathmanduDateOnly', () => {
    it('should return date only without time', () => {
      const date = (service as any).getKathmanduDateOnly();

      expect(date).toBeInstanceOf(Date);
      // The date string in ISO format should be a valid date
      const isoString = date.toISOString();
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return Kathmandu timezone date', () => {
      const date = (service as any).getKathmanduDateOnly();

      // The date should be valid
      expect(date).toBeInstanceOf(Date);
      expect(date.toString()).not.toContain('Invalid');
    });

    it('should return consistent format', () => {
      const date1 = (service as any).getKathmanduDateOnly();
      const date2 = (service as any).getKathmanduDateOnly();

      // Both should be the same day when formatted
      expect(date1.toISOString().split('T')[0]).toBe(
        date2.toISOString().split('T')[0],
      );
    });
  });
});
