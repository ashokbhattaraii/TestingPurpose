import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';

import type { UserPayload } from '../common/decorators/current-user.decorator/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateRequestDto, @CurrentUser() user: UserPayload) {
    console.log('Creating request for user:', user.id);
    return this.requestService.createRequest(user.id, dto);
  }

  @Get('requests')
  @UseGuards(AuthGuard('jwt'))
  getAllRequests(@CurrentUser() user: UserPayload) {
    console.log('Fetching requests from user:', user.id);
    return this.requestService.getRequests();
  }
}
