
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AnnouncementsService } from '../services/announcements.service';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
  ) {}

  @Get('learning/:slug/announcements')
  getCourseAnnouncements(
    @Req() req: Request & { user: { sub: string } },
    @Param('slug') slug: string,
  ) {
    return this.announcementsService.getCourseAnnouncements(
      req.user.sub,
      slug,
    );
  }
}
