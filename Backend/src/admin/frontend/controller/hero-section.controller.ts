import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { HeroSectionDto } from '../dto/hero-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { HeroSectionService } from '../services/hero-section.service';

@Controller('admin/hero-section')
@UseGuards(AdminAuthGuard)
export class HeroSectionController {
  constructor(
    private readonly heroSectionService: HeroSectionService,
  ) {}

  @Get()
  async index(@Query('code') code = 'en') {
    return this.heroSectionService.index(code);
  }

  @Get(':id')
  async show(
    @Param('id') id: string,
    @Query('code') code = 'en',
  ) {
    return this.heroSectionService.show(BigInt(id), code);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner_image', maxCount: 1 },
      { name: 'banner_background', maxCount: 1 },
      { name: 'banner_background_two', maxCount: 1 },
      { name: 'hero_background', maxCount: 1 },
      { name: 'enroll_students_image', maxCount: 1 },
    ]),
  )
  async store(
    @Body() dto: HeroSectionDto,
    @UploadedFiles()
    files: {
      banner_image?: Express.Multer.File[];
      banner_background?: Express.Multer.File[];
      banner_background_two?: Express.Multer.File[];
      hero_background?: Express.Multer.File[];
      enroll_students_image?: Express.Multer.File[];
    },
  ) {
    return this.heroSectionService.store(dto, files);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner_image', maxCount: 1 },
      { name: 'banner_background', maxCount: 1 },
      { name: 'banner_background_two', maxCount: 1 },
      { name: 'hero_background', maxCount: 1 },
      { name: 'enroll_students_image', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: HeroSectionDto,
    @UploadedFiles()
    files: {
      banner_image?: Express.Multer.File[];
      banner_background?: Express.Multer.File[];
      banner_background_two?: Express.Multer.File[];
      hero_background?: Express.Multer.File[];
      enroll_students_image?: Express.Multer.File[];
    },
  ) {
    return this.heroSectionService.update(
      BigInt(id),
      dto,
      files,
    );
  }

  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return this.heroSectionService.destroy(BigInt(id));
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.heroSectionService.toggleStatus(BigInt(id));
  }
}