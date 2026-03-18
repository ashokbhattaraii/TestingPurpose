import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SlackService } from './slack.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(
    private readonly slackService: SlackService,
  ) { }

  @Public()
  @Post('interaction')
  async handleInteraction(@Body() body: any) {
    this.logger.log('Received Slack interaction', body);
    return { status: 'ok' };
  }
}
