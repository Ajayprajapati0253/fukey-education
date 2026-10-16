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
import { AboutAffordableEducationService } from '../services/about-affordable-education.service';
import { AboutAffordableEducationDto } from '../dto/about-affordable-education.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/about-affordable-education')
@UseGuards(AdminAuthGuard)
export class AboutAffordableEducationController {
  constructor(
    private readonly aboutAffordableEducationService: AboutAffordableEducationService,
  ) {}

  @Get()
  async get(@Query('code') code = 'en') {
    return this.aboutAffordableEducationService.get(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: AboutAffordableEducationDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.aboutAffordableEducationService.update(dto.code, {
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      button_text: dto.button_text,
      button_url: dto.button_url,
      image: image?.filename,
    });
  }
}