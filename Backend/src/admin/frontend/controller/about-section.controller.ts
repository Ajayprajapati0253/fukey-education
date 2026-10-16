import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AboutSectionService } from '../services/about-section.service';
import { AboutSectionDto } from '../dto/about-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';



@Controller('admin/about-section')
@UseGuards(AdminAuthGuard)
export class AboutSectionController {
  constructor(
    private readonly aboutSectionService: AboutSectionService,
  ) {}

  @Get()
  async get(@Query('code') code = 'en') {
    return this.aboutSectionService.get(code);
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'image_two', maxCount: 1 },
      { name: 'image_three', maxCount: 1 },
    ]),
  )
  async update(
    @Body() dto: AboutSectionDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
      image_three?: Express.Multer.File[];
    },
  ) {
    return this.aboutSectionService.update(dto.code, {
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      button_text: dto.button_text,

      button_url: dto.button_url,
      video_url: dto.video_url,
      year_experience: dto.year_experience,
      course_success: dto.course_success,
      phone_number: dto.phone_number,

      image: files.image?.[0]?.filename,
      image_two: files.image_two?.[0]?.filename,
      image_three: files.image_three?.[0]?.filename,
    });
  }
}