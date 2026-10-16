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

import { OurFeaturesSectionDto } from '../dto/our-features-section.dto';
import { OurFeaturesSectionService } from '../services/our-features-section.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/our-features-section')
@UseGuards(AdminAuthGuard)
export class OurFeaturesSectionController {
  constructor(
    private readonly ourFeaturesSectionService: OurFeaturesSectionService,
  ) {}

  @Get()
  async index(@Query('code') code = 'en') {
    return this.ourFeaturesSectionService.index(code);
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_one', maxCount: 1 },
      { name: 'image_two', maxCount: 1 },
      { name: 'image_three', maxCount: 1 },
      { name: 'image_four', maxCount: 1 },
    ]),
  )
  async update(
    @Body() dto: OurFeaturesSectionDto,
    @UploadedFiles()
    files: {
      image_one?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
      image_three?: Express.Multer.File[];
      image_four?: Express.Multer.File[];
    },
  ) {
    return this.ourFeaturesSectionService.update(
      dto,
      files,
    );
  }
}