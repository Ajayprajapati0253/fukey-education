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

import { AboutHindiEnglishBatchDto } from '../dto/about-hindi-english-batch.dto';
import { AboutHindiEnglishBatchService } from '../services/about-hindi-english-batch.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/about-hindi-english-batch')
@UseGuards(AdminAuthGuard)
export class AboutHindiEnglishBatchController {
  constructor(
    private readonly aboutHindiEnglishBatchService: AboutHindiEnglishBatchService,
  ) {}

  @Get()
  async get(@Query('code') code = 'en') {
    return this.aboutHindiEnglishBatchService.get(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: AboutHindiEnglishBatchDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.aboutHindiEnglishBatchService.update(dto.code, {
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      button_text: dto.button_text,
      button_url: dto.button_url,
      image: image?.filename,
    });
  }
}