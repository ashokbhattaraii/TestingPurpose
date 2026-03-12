import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL!;

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
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🍴 Call For Lunch',
                emoji: true,
              },
              value: 'call_for_lunch',
              action_id: 'call_for_lunch_action',
              style: 'primary',
            },
          ],
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

  async sendLunchCall(date?: string) {
    const displayDate = date || new Date().toISOString().split('T')[0];
    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🍱 *Daily Lunch Count (${displayDate})*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '<!here> 🍴 *Lunch is Ready!* Please be on time 🍱',
          },
        },
      ],
    };

    try {
      await axios.post(this.webhookUrl, message);
      this.logger.log('Lunch Call sent to Slack');
    } catch (error) {
      this.logger.error('Failed to send Lunch Call to Slack', error);
    }
  }
}
