import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LeadershipDto } from '../dto/leadership.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { LeadershipService } from '../services/leadership.service';

@Controller('admin/leadership')
@UseGuards(AdminAuthGuard)
export class LeadershipController {
  constructor(
    private readonly leadershipService: LeadershipService,
  ) {}

  @Get()
  async index(@Query('code') code = 'en') {
    return this.leadershipService.index(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: LeadershipDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.leadershipService.update(
      dto,
      image,
    );
  }
}