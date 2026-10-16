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

import { SliderSectionDto } from '../dto/slider-section.dto';
import { SliderSectionService } from '../services/slider-section.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/slider-section')
@UseGuards(AdminAuthGuard)

export class SliderSectionController {
  constructor(
    private readonly sliderSectionService: SliderSectionService,
  ) {}

  @Get()
  async index(@Query('code') code = 'en') {
    return this.sliderSectionService.index(code);
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_one', maxCount: 1 },
      { name: 'image_two', maxCount: 1 },
      { name: 'image_three', maxCount: 1 },
    ]),
  )
  async update(
    @Body() dto: SliderSectionDto,
    @UploadedFiles()
    files: {
      image_one?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
      image_three?: Express.Multer.File[];
    },
  ) {
    return this.sliderSectionService.update(
      dto,
      files,
    );
  }
}