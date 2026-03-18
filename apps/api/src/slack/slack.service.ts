import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendLunchSummary(data: {
    date: string;
    total: number;
    vegCount: number;
    nonVegCount: number;
    vegNames: string[];
    nonVegNames: string[];
  }) {
    const webhookUrl = this.configService.get<string>('SLACK_HOOK_URL');
    if (!webhookUrl) {
      this.logger.error('SLACK_HOOK_URL is missing in environment variables');
      return;
    }

    const { date, total, vegCount, nonVegCount, vegNames, nonVegNames } = data;

    // Combine with tags and sort
    const allAttendees = [
      ...vegNames.map((name) => `• ${name} (Veg)`),
      ...nonVegNames.map((name) => `• ${name} (Non-Veg)`),
    ].sort();

    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🍱 *Daily Lunch Count (${date})*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Total Employees: ${total}*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Veg: ${vegCount}*  |  *Non-Veg: ${nonVegCount}*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Employees:*\n${allAttendees.length > 0 ? allAttendees.join('\n') : '_No entries today_'}`,
          },
        },
      ],
    };

    try {
      await axios.post(webhookUrl, message);
      this.logger.log('Lunch Summary Sent to Slack');
    } catch (error: any) {
      this.logger.error(
        'Failed to send Lunch Summary to Slack',
        error?.response?.data || error.message,
      );
    }
  }


}
