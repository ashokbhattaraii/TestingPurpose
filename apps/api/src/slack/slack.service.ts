import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly configService: ConfigService) { }

  async sendLunchSummary(data: {
    date: string;
    total: number;
    vegCount: number;
    nonVegCount: number;
    vegNames: string[];
    nonVegNames: string[];
  }) {
    const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');
    const channelId = this.configService.get<string>('SLACK_CHANNEL_ID');

    if (!botToken) {
      this.logger.error('SLACK_BOT_TOKEN is missing in environment variables');
      return;
    }

    if (!channelId) {
      // Fallback: try webhook if no channel ID configured
      return this.sendLunchSummaryViaWebhook(data);
    }

    const { date, total, vegCount, nonVegCount, vegNames, nonVegNames } = data;

    // Combine with tags and sort
    const allAttendees = [
      ...vegNames.map((name) => `• ${name} (Veg)`),
      ...nonVegNames.map((name) => `• ${name} (Non-Veg)`),
    ].sort();

    const blocks = [
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
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🍽️ Ready for Lunch',
              emoji: true,
            },
            style: 'primary',
            action_id: 'lunch_ready_clicked',
            value: date,
          },
        ],
      },
    ];

    try {
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: channelId,
          text: `🍱 Daily Lunch Count (${date}) — ${total} employees`,
          blocks,
        },
        {
          headers: {
            Authorization: `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log('Lunch Summary Sent to Slack via Bot API');
    } catch (error: any) {
      this.logger.error(
        'Failed to send Lunch Summary to Slack',
        error?.response?.data || error.message,
      );
    }
  }

  /**
   * Fallback: Send lunch summary via webhook (no interactive buttons).
   */
  private async sendLunchSummaryViaWebhook(data: {
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

    const allAttendees = [
      ...vegNames.map((name) => `• ${name} (Veg)`),
      ...nonVegNames.map((name) => `• ${name} (Non-Veg)`),
    ].sort();

    const message = {
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `🍱 *Daily Lunch Count (${date})*` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Total Employees: ${total}*` },
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
        { type: 'divider' },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🍽️ Ready for Lunch',
                emoji: true,
              },
              style: 'primary',
              action_id: 'lunch_ready_clicked',
              value: date,
            },
          ],
        },
      ],
    };

    try {
      await axios.post(webhookUrl, message);
      this.logger.log('Lunch Summary Sent to Slack via Webhook');
    } catch (error: any) {
      this.logger.error(
        'Failed to send Lunch Summary to Slack',
        error?.response?.data || error.message,
      );
    }
  }

  /**
   * Update the original Slack message to replace the button with a success confirmation.
   * Called after the "Ready for Lunch" button is clicked.
   * Supports both chat.update (for bot messages) and response_url (for webhook messages).
   */
  async updateMessageWithConfirmation(
    channelId: string,
    messageTs: string,
    clickedByUser: string,
    originalBlocks: any[],
    responseUrl?: string,
  ) {
    const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');

    // Remove the actions block and add a confirmation section
    const updatedBlocks = originalBlocks
      .filter((block) => block.type !== 'actions')
      .concat([
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Successfully called for lunch!*\n_Notifications sent by <@${clickedByUser}>_`,
          },
        },
      ]);

    try {
      if (responseUrl) {
        // Use response_url for webhook messages or as an alternative for bot messages
        await axios.post(responseUrl, {
          replace_original: true,
          blocks: updatedBlocks,
          text: '✅ Successfully called for lunch!',
        });
        this.logger.log('Slack message updated via response_url');
      } else {
        // Use traditional chat.update API
        if (!botToken) return;
        await axios.post(
          'https://slack.com/api/chat.update',
          {
            channel: channelId,
            ts: messageTs,
            blocks: updatedBlocks,
            text: '✅ Successfully called for lunch!',
          },
          {
            headers: {
              Authorization: `Bearer ${botToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.logger.log('Slack message updated via chat.update');
      }
    } catch (error: any) {
      this.logger.error(
        'Failed to update Slack message',
        error?.response?.data || error.message,
      );
    }
  }

  /**
   * Send a direct message to a Slack user by their email address.
   * Uses conversations.open to create a proper DM channel, then posts the message.
   */
  async sendDirectMessageByEmail(
    email: string,
    message: string,
  ): Promise<boolean> {
    const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');
    if (!botToken) {
      this.logger.error('SLACK_BOT_TOKEN is missing in environment variables');
      return false;
    }

    try {
      // Step 1: Look up Slack user ID by email
      this.logger.log(`Looking up Slack user for email: ${email}`);
      const lookupResponse = await axios.get(
        'https://slack.com/api/users.lookupByEmail',
        {
          params: { email },
          headers: { Authorization: `Bearer ${botToken}` },
        },
      );

      const lookupData = lookupResponse.data as any;
      if (!lookupData.ok) {
        this.logger.warn(
          `Could not find Slack user for email ${email}: ${lookupData.error}`,
        );
        return false;
      }

      const slackUserId = lookupData.user.id;
      this.logger.log(`Found Slack user ID ${slackUserId} for email ${email}`);

      // Step 2: Open a DM channel (requires im:write scope)
      let targetChannel = slackUserId;
      try {
        const convResponse = await axios.post(
          'https://slack.com/api/conversations.open',
          { users: slackUserId },
          {
            headers: {
              Authorization: `Bearer ${botToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const convData = convResponse.data as any;
        if (convData.ok) {
          targetChannel = convData.channel.id;
          this.logger.log(`Opened DM channel ${targetChannel} for user ${slackUserId}`);
        } else {
          this.logger.warn(
            `Could not open DM channel with ${email} (error: ${convData.error}). Falling back to User ID.`,
          );
        }
      } catch (convError: any) {
        this.logger.warn(
          `Check Slack App reinstall: conversations.open failed for ${email}. Falling back to User ID.`,
        );
        // We'll fall back to targetChannel = slackUserId below
      }

      // Step 3: Send message to the DM channel (or user ID fallback)
      const dmResponse = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: targetChannel,
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const dmData = dmResponse.data as any;
      if (!dmData.ok) {
        this.logger.error(
          `Failed to send DM to ${email} (channel: ${targetChannel}): ${dmData.error}`,
        );
        return false;
      }

      this.logger.log(`DM successfully sent to ${email} via channel ${targetChannel}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Error sending DM to ${email}`,
        error?.response?.data || error.message,
      );
      return false;
    }
  }

  /**
   * Send "Lunch is Ready" DM to all attendees who have collected their token.
   * Dedups by Slack User ID to prevent duplicate messages.
   */
  async sendLunchReadyNotifications(
    attendees: { email: string; name: string; preferredLunchOption: string }[],
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    const processedUserIds = new Set<string>();

    const message = `🍽️ *Lunch is Ready!*\nHead over to the dining area. Your meal is waiting for you. Enjoy! 🎉`;

    this.logger.log(`Starting notifications for ${attendees.length} attendees.`);

    for (const attendee of attendees) {
      try {
        // Step 1: Look up Slack user ID
        const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');
        const lookupResponse = await axios.get(
          'https://slack.com/api/users.lookupByEmail',
          {
            params: { email: attendee.email },
            headers: { Authorization: `Bearer ${botToken}` },
          },
        );

        const lookupData = lookupResponse.data as any;
        if (!lookupData.ok) {
          this.logger.warn(`Skip: No Slack user for ${attendee.email}`);
          failed++;
          continue;
        }

        const slackUserId = lookupData.user.id;

        // Prevent duplicate DMs to the same user identity
        if (processedUserIds.has(slackUserId)) {
          this.logger.log(`Skip: Already sent to user ID ${slackUserId} (${attendee.email})`);
          continue;
        }

        // Step 2: Send the DM
        const dmResponse = await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel: slackUserId,
            text: message,
          },
          {
            headers: {
              Authorization: `Bearer ${botToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const dmData = dmResponse.data as any;
        if (dmData.ok) {
          this.logger.log(`✓ DM delivered to ${attendee.email} (ID: ${slackUserId})`);
          sent++;
          processedUserIds.add(slackUserId);
        } else {
          this.logger.error(`✗ Failed to deliver DM to ${attendee.email}: ${dmData.error}`);
          failed++;
        }
      } catch (err: any) {
        this.logger.error(`✗ Error processing ${attendee.email}: ${err.message}`);
        failed++;
      }
    }

    this.logger.log(`Done. ${sent} sent, ${failed} failed.`);
    return { sent, failed };
  }
}
