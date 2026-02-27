import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { AuthGuard } from '@nestjs/passport'; // Passport ko default use garne
import { UserRole } from '@prisma/client';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Direct use garda import error hudaina
  async create(@Body() createDto: CreateAnnouncementDto, @Req() req) {
    // RolesGuard ko thau ma yahi logic haldim, error free hunchha
    const user = req.user;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only Admin or SuperAdmin can create announcements');
    }

    return this.announcementsService.createAnnouncement(createDto, user.id);
  }

  @Get()
  async findAll() {
    return this.announcementsService.findAll();
  }
}