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

import { FaqSectionDto } from '../dto/faq-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { FaqSectionService } from '../services/faq-section.service';

@Controller('admin/faq-section')
@UseGuards(AdminAuthGuard)
export class FaqSectionController {
  constructor(
    private readonly faqSectionService: FaqSectionService,
  ) {}

  @Get()
  async get() {
    return this.faqSectionService.get();
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'image_two', maxCount: 1 },
    ]),
  )
  async update(
    @Body() dto: FaqSectionDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
    },
  ) {
    return this.faqSectionService.update({
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      total_languages: dto.total_languages,
      image: files.image?.[0]?.filename,
      image_two: files.image_two?.[0]?.filename,
    });
  }
}