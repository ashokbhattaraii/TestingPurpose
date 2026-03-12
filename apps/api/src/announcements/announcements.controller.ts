import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Logger } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('announcements')
export class AnnouncementsController {
  private readonly logger = new Logger(AnnouncementsController.name);

  constructor(private readonly announcementsService: AnnouncementsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createDto: CreateAnnouncementDto, @Req() req) {
    const user = req.user;
    if (!user.roles?.some(r => r.toUpperCase().includes('ADMIN'))) {
      throw new Error('Unauthorized: Only an Admin can create announcements');
    }
    return this.announcementsService.createAnnouncement(createDto, user.id);
  }

  @Get()
  async findAll() {
    return this.announcementsService.findAll();
  }

  @Patch(':id/pin')
  @UseGuards(AuthGuard('jwt'))
  async togglePin(@Param('id') id: string, @Body('pinned') pinned: boolean, @Req() req) {
    const user = req.user;
    if (!user.roles?.some(r => r.toUpperCase().includes('ADMIN'))) {
      throw new Error('Unauthorized: Only an Admin can pin announcements');
    }
    return this.announcementsService.togglePin(id, pinned);
  }
}