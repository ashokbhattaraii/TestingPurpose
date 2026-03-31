import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { CryptoService } from '../auth/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  const mockUserService = {
    getUsers: jest.fn().mockResolvedValue([]),
    getAdminUsers: jest.fn().mockResolvedValue([]),
    getUserById: jest.fn().mockResolvedValue(null),
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
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
