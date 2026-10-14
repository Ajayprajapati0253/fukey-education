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
import { AboutAllSubjectsDto } from '../dto/about-all-subjects.dto';
import { AboutAllSubjectsService } from '../services/about-all-subjects.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/about-all-subjects')
@UseGuards(AdminAuthGuard)
export class AboutAllSubjectsController {
  constructor(
    private readonly aboutAllSubjectsService: AboutAllSubjectsService,
  ) {}

  @Get()
  async get(@Query('code') code = 'en') {
    return this.aboutAllSubjectsService.get(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: AboutAllSubjectsDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.aboutAllSubjectsService.update(dto.code, {
      short_title: dto.short_title,
      title: dto.title,
      description: dto.description,
      button_text: dto.button_text,
      button_url: dto.button_url,
      image: image?.filename,
    });
  }
}