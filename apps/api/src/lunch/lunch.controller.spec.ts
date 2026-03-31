import { Test, TestingModule } from '@nestjs/testing';
import { LunchController } from './lunch.controller';
import { LunchService } from './lunch.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlackService } from '../slack/slack.service';
import { AuthGuard } from '../auth/auth.guard';
import { CryptoService } from '../auth/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';

describe('LunchController', () => {
  let controller: LunchController;

  const mockPrismaService = {
    lunch: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockSlackService = {
    send: jest.fn().mockResolvedValue({}),
  };

  const mockLunchService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    attendance: jest.fn().mockResolvedValue({}),
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
      controllers: [LunchController],
      providers: [
        {
          provide: LunchService,
          useValue: mockLunchService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SlackService,
          useValue: mockSlackService,
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

    controller = module.get<LunchController>(LunchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
