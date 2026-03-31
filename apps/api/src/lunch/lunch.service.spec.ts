import { Test, TestingModule } from '@nestjs/testing';
import { LunchService } from './lunch.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlackService } from '../slack/slack.service';
import { NotificationGateway } from '../notification/notification.gateway';

describe('LunchService', () => {
  let service: LunchService;

  const mockPrismaService = {
    lunch: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  };

  const mockSlackService = {
    sendDirectMessage: jest.fn().mockResolvedValue({}),
  };

  const mockNotificationGateway = {
    broadcastLunchUpdate: jest.fn(),
    server: {
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LunchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SlackService,
          useValue: mockSlackService,
        },
        {
          provide: NotificationGateway,
          useValue: mockNotificationGateway,
        },
      ],
    }).compile();

    service = module.get<LunchService>(LunchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});