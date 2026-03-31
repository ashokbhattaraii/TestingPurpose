import { Test, TestingModule } from '@nestjs/testing';
import { RequestService } from './request.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('RequestService', () => {
  let service: RequestService;

  const mockPrismaService = {
    request: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  const mockNotificationService = {
    send: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
