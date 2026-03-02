import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator/current-user.decorator';

import type { UserPayload } from '../common/decorators/current-user.decorator/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Roles } from 'src/common/decorators/roles-decorator/roles.decorator';
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) { }

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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  getRequestById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    console.log('Fetching request with ID:', id);
    return this.requestService.getRequestById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  updateRequest(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestService.updateRequest(id, user.id, dto);
  }

  @Post(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestService.updateRequestStatus(id, dto);
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'SUPER_ADMIN')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignRequestDto,
  ) {
    return this.requestService.assignRequest(id, dto);
  }

  @Post(':id/reopen')
  @UseGuards(AuthGuard('jwt'))

  reopen(
    @Param('id') id: string,
  ) {
    return this.requestService.reopenRequest(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.requestService.deleteRequest(id);
  }
}
