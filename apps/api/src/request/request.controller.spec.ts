import { Test, TestingModule } from '@nestjs/testing';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuthGuard } from '../auth/auth.guard';
import { CryptoService } from '../auth/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';

describe('RequestController', () => {
  let controller: RequestController;

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

  const mockRequestService = {
    createRequest: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
    updateRequest: jest.fn().mockResolvedValue({}),
  };

  const mockCryptoService = {
    encrypt: jest.fn().mockReturnValue('encrypted'),
    decrypt: jest.fn().mockReturnValue('decrypted'),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
    verify: jest.fn().mockReturnValue({ sub: 'test' }),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  const mockRsOfficeClient = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestController],
      providers: [
        {
          provide: RequestService,
          useValue: mockRequestService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: RS_OFFICE_CLIENT,
          useValue: mockRsOfficeClient,
        },
      ],
    }).compile();

    controller = module.get<RequestController>(RequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
