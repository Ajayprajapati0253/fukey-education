import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CounterSectionDto } from '../dto/counter-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { CounterSectionService } from '../services/counter-section.service';

@Controller('admin/counter-section')
@UseGuards(AdminAuthGuard)
export class CounterSectionController {
  constructor(
    private readonly counterSectionService: CounterSectionService,
  ) {}

  @Get()
  async get() {
    return this.counterSectionService.get();
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: CounterSectionDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.counterSectionService.update({
      total_student_count: dto.total_student_count,
      total_instructor_count: dto.total_instructor_count,
      total_courses_count: dto.total_courses_count,
      total_awards_count: dto.total_awards_count,
      button_url: dto.button_url,
      section_title: dto.section_title,
      description: dto.description,
      button_text: dto.button_text,
      image: image?.filename,
    });
  }
}