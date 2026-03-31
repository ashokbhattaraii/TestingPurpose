import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SlackService } from './slack.service';
import axios from 'axios';

// 1. Axios lai mock gareko
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SlackService', () => {
  let service: SlackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SLACK_HOOK_URL') return 'https://hooks.slack.com/test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SlackService>(SlackService);
    
    // 2. Clear previous mocks to avoid "leaks"
    jest.clearAllMocks();
  });

  it('should send lunch summary (Fixing your error)', async () => {
    // 3. Timro error aaune line yahi ho, aba audaina
    mockedAxios.post.mockResolvedValueOnce({ 
      status: 200,
       data: {}
       } as any);

    const mockData = {
      date: '2025-01-15',
      total: 5,
      vegCount: 3,
      nonVegCount: 2,
      vegNames: ['Alice'],
      nonVegNames: ['Bob'],
    };

    await service.sendLunchSummary(mockData);
    
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});