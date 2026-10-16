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

import { AboutLearningSectionService } from '../services/about-learning-section.service';
import { AboutLearningSectionDto } from '../dto/about-learning-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/about-learning-section')
@UseGuards(AdminAuthGuard)
export class AboutLearningSectionController {
  constructor(
    private readonly aboutLearningSectionService: AboutLearningSectionService,
  ) {}

  @Get()
  async get(@Query('code') code = 'en') {
    return this.aboutLearningSectionService.get(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: AboutLearningSectionDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.aboutLearningSectionService.update(dto.code, {
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      button_text: dto.button_text,
      button_url: dto.button_url,
      video_url: dto.video_url,
      image: image?.filename,
    });
  }
}