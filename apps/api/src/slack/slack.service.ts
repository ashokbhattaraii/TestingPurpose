import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl = process.env.SLACK_HOOK_URL!;

  async sendLunchSummary(data: {
    date: string;
    total: number;
    vegCount: number;
    nonVegCount: number;
    vegNames: string[];
    nonVegNames: string[];
  }) {
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
      await axios.post(this.webhookUrl, message);
      this.logger.log('Lunch Summary Sent to Slack');
    } catch (error) {
      this.logger.error('Failed to send Lunch Summary to Slack', error);
    }
  }


}
