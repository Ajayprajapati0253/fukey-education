import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { BannerSectionDto } from '../dto/banner-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { BannerSectionService } from '../services/banner-section.service';

@Controller('admin/banner-section')
@UseGuards(AdminAuthGuard)
export class BannerSectionController {
  constructor(
    private readonly bannerSectionService: BannerSectionService,
  ) {}

  @Get()
  async get() {
    return this.bannerSectionService.get();
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'instructor_image', maxCount: 1 },
      { name: 'student_image', maxCount: 1 },
      { name: 'bg_image', maxCount: 1 },
    ]),
  )
  async update(
    @Body() dto: BannerSectionDto,
    @UploadedFiles()
    files: {
      instructor_image?: Express.Multer.File[];
      student_image?: Express.Multer.File[];
      bg_image?: Express.Multer.File[];
    },
  ) {
    return this.bannerSectionService.update({
      video_url: dto.video_url,
      instructor_image: files.instructor_image?.[0]?.filename,
      student_image: files.student_image?.[0]?.filename,
      bg_image: files.bg_image?.[0]?.filename,
    });
  }
}