import { Controller, Post, Body } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack') // This makes the base route /slack
export class SlackController {
  constructor(private readonly slackService: SlackService) { }

  @Post()
  sendNotification() {
    this.slackService.sendLunchNotification();
  }

}