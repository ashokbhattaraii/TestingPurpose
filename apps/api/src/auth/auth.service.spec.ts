import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CryptoService } from './crypto.service';
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
    verify: jest.fn().mockReturnValue({ sub: 'test' }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({}),
  };

  const mockCryptoService = {
    encrypt: jest.fn().mockReturnValue('encrypted'),
    decrypt: jest.fn().mockReturnValue('decrypted'),
  };

  const mockRsOfficeClient = {};

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key-123';
    process.env.APP_ID = 'test-app-id';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: RS_OFFICE_CLIENT,
          useValue: mockRsOfficeClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.APP_ID;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
