import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';

import type { UserPayload } from '../common/decorators/current-user.decorator/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Roles } from '../common/decorators/roles-decorator/roles.decorator';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateRequestDto, @CurrentUser() user: UserPayload) {
    return this.requestService.createRequest(user.id, dto);
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  getAllRequests(@CurrentUser() user: UserPayload) {
    return this.requestService.getRequests();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getRequestById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    console.log('Fetching request with ID:', id);
    return this.requestService.getRequestById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateRequest(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestService.updateRequest(id, user.id, dto);
  }

  @Post(':id/status')
  @UseGuards(AuthGuard)
  @Roles('admin')
  updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestService.updateRequestStatus(id, user.id, dto);
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard)
  @Roles('admin')
  assign(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: AssignRequestDto,
  ) {
    return this.requestService.assignRequest(id, user.id, dto);
  }

  @Post(':id/reopen')
  @UseGuards(AuthGuard)
  reopen(@Param('id') id: string) {
    return this.requestService.reopenRequest(id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  cancel(@Param('id') id: string) {
    return this.requestService.cancelRequest(id);
  }
}
