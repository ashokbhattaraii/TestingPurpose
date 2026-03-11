import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class SlackService {
    private readonly logger = new Logger(SlackService.name)
    private readonly webhookUrl = process.env.WEB_HOOK_URL!;

    async sendLunchSummary(data: {
        date: string,
        total: number;
        vegCount: number,
        nonVegCount: number,
        vegNames: string[];
        nonVegNames: string[];

    }) {
        const { date, total, vegCount, nonVegCount, vegNames, nonVegNames } = data;
        // Format names as numbered lists with better visual hierarchy
        const formatNames = (names: string[]) =>
            names.length > 0
                ? names.map((n, i) => `${i + 1}. ${n}`).join('\n')
                : '_No attendees_';

        const message = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `Lunch Summary — ${date}`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Summary*\n┌─────────────────────┐\n│ Total Attending: *${total}*\n└─────────────────────┘`,
                    },
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Vegetarian*\n\`\`\`${vegCount}\`\`\``,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Non-Vegetarian*\n\`\`\`${nonVegCount}\`\`\``,
                        },
                    ],
                },
                { type: 'divider' },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Vegetarian Attendees* (${vegCount})\n${formatNames(vegNames)}`,
                    },
                },
                { type: 'divider' },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Non-Vegetarian Attendees* (${nonVegCount})\n${formatNames(nonVegNames)}`,
                    },
                },
                { type: 'divider' },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `Sent automatically at 11:00 AM NPT by OMUS`,
                        },
                    ],
                },
            ],
        };

        try {
            await axios.post(this.webhookUrl, message)
            this.logger.log("Lunch Summary Sent to Slack")
        } catch (error) {
            this.logger.error("Failed to send Lunch Summary to Slack", error)
        }
    }
}