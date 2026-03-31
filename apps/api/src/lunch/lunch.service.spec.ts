import { Test, TestingModule } from '@nestjs/testing';
import { LunchService } from './lunch.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlackService } from '../slack/slack.service';

describe('LunchService', () => {
  let service: LunchService;

  const mockPrismaService = {
    lunch: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  const mockSlackService = {
    send: jest.fn().mockResolvedValue({}),
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
      ],
    }).compile();

    service = module.get<LunchService>(LunchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
