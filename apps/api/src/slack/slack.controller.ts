import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { SlackService } from './slack.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(
    private readonly slackService: SlackService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('interaction')
  async handleInteraction(@Body() body: any, @Req() req: any) {
    // Slack sends payload as a stringified JSON in a form-encoded field
    const payload = body.payload ? JSON.parse(body.payload) : body;
    this.logger.log('Received Slack interaction', payload);

    if (payload.actions && payload.actions[0].action_id === 'call_for_lunch_action') {
      this.logger.log('Call for lunch action triggered');
      await this.slackService.sendLunchCall();

      // Notify all users in the system
      await this.notificationService.notifyAllUsers(
        NotificationType.SYSTEM,
        '🍴 Lunch is Served!',
        'Lunch has been served. Please come to the dining area!',
        '/dashboard/lunch', // Assuming there's a lunch page
      );

      return { text: 'Lunch call has been sent to Slack and System Notifications! 🍴' };
    }

    return { ok: true };
  }
}
