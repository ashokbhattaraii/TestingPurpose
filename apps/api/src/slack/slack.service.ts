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
        // Format names as bullet lists
        const formatNames = (names: string[]) =>
            names.length > 0
                ? names.map(n => `• ${n}`).join('\n')
                : '_None_';

        const message = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `🍱 Lunch Summary — ${date}`,
                    },
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Total Attending:*\n${total}` },
                        { type: 'mrkdwn', text: `*🥦 Veg:*\n${vegCount}` },
                        { type: 'mrkdwn', text: `*🍗 Non-Veg:*\n${nonVegCount}` },
                    ],
                },
                { type: 'divider' },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*🥦 Veg People (${vegCount}):*\n${formatNames(vegNames)}`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*🍗 Non-Veg People (${nonVegCount}):*\n${formatNames(nonVegNames)}`,
                    },
                },

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