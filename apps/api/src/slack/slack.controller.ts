import { Controller, Post, Body, Logger, Inject, forwardRef } from '@nestjs/common';
import { SlackService } from './slack.service';
import { Public } from '../common/decorators/public.decorator';
import { LunchService } from '../lunch/lunch.service';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(
    private readonly slackService: SlackService,
    @Inject(forwardRef(() => LunchService))
    private readonly lunchService: LunchService,
  ) { }

  @Public()
  @Post('interaction')
  async handleInteraction(@Body() body: any) {
    // Slack sends interaction payloads as application/x-www-form-urlencoded
    // with a 'payload' field containing JSON
    const payload = typeof body.payload === 'string'
      ? JSON.parse(body.payload)
      : body;

    this.logger.log('Received Slack interaction', JSON.stringify(payload.type));

    // Handle button clicks
    if (payload.type === 'block_actions') {
      const action = payload.actions?.[0];

      if (action?.action_id === 'lunch_ready_clicked') {
        this.logger.log('Lunch Ready button clicked in Slack');

        // Send DMs to all attendees
        const result = await this.lunchService.notifyLunchReady();
        this.logger.log(`Lunch ready result: ${JSON.stringify(result)}`);

        // Update the original message to show confirmation
        const channelId = payload.channel?.id;
        const messageTs = payload.message?.ts;
        const clickedByUser = payload.user?.id;
        const originalBlocks = payload.message?.blocks || [];
        const responseUrl = payload.response_url;

        if (responseUrl || (channelId && messageTs)) {
          await this.slackService.updateMessageWithConfirmation(
            channelId,
            messageTs,
            clickedByUser,
            originalBlocks,
            responseUrl,
          );
        }

        return { status: 'ok' };
      }
    }

    return { status: 'ok' };
  }
}
