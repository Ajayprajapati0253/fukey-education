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

import { OurPurposeDto } from '../dto/our-purpose.dto';
import { OurPurposeService } from '../services/our-purpose.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/our-purpose')

@UseGuards(AdminAuthGuard)
export class OurPurposeController {
  constructor(
    private readonly ourPurposeService: OurPurposeService,
  ) {}

  @Get()
  async index(@Query('code') code = 'en') {
    return this.ourPurposeService.index(code);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() dto: OurPurposeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.ourPurposeService.update(
      dto,
      image,
    );
  }
}