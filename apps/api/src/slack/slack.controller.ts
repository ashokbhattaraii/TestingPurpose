import { Controller, Post, Body, Req, Logger, Res } from '@nestjs/common';
import { SlackService } from './slack.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import axios from 'axios';
@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(
    private readonly slackService: SlackService,
    private readonly notificationService: NotificationService,
  ) {}

  @Public()
  @Post('interaction')
  async handleInteraction(@Body() body: any, @Req() req: any, @Res() res: any) {
    res.status(200).send();
    // Slack sends payload as a stringified JSON in a form-encoded field
    const payload = body.payload ? JSON.parse(body.payload) : body;
    this.logger.log('Received Slack interaction', payload);

    if (
      payload.actions &&
      payload.actions[0].action_id === 'call_for_lunch_action'
    ) {
      const originalBlocks = payload.message.blocks;
      const blocksWithoutButton = originalBlocks.filter(
        (block: any) => block.type !== 'actions',
      );
      await axios.post(payload.response_url, {
        replace_original: true,
        blocks: blocksWithoutButton,
      });
      this.logger.log('Call for lunch action triggered');
      const originalHeader = originalBlocks[0]?.text?.text || '';
      const dateMatch = originalHeader.match(/\((.*?)\)/);
      const date = dateMatch ? dateMatch[1] : undefined;
      await this.slackService.sendLunchCall(date);

      // Notify all users in the system
      await this.notificationService.notifyAllUsers(
        NotificationType.SYSTEM,
        '🍴 Lunch is Ready!',
        'Lunch is ready, please be on time!',
        '/dashboard/lunch', // Assuming there's a lunch page
      );
    }
  }
}
