
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TestimonialService } from '../services/testimonial.service';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';

import { createUploadOptions } from '../../../common/upload/upload.config';
import {
  UPLOAD_DIRECTORIES,
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_SIZE,
} from '../../../common/upload/upload.constants';

const testimonialUploadOptions = createUploadOptions({
  directory: UPLOAD_DIRECTORIES.CUSTOM_IMAGES,
  allowedMimeTypes: ALLOWED_IMAGE_MIMES,
  maxSize: MAX_IMAGE_SIZE,
});

@Controller('admin/testimonials')
export class TestimonialController {
  constructor(
    private readonly testimonialService: TestimonialService,
  ) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe)
    limit: number,
  ) {
    return this.testimonialService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.findOne(BigInt(id));
  }

  @Get(':id/edit')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Query('code') code?: string,
  ) {
    return this.testimonialService.edit(BigInt(id), code);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', testimonialUploadOptions),
  )
  create(
    @Body() dto: CreateTestimonialDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imagePath = image
      ? `${UPLOAD_DIRECTORIES.CUSTOM_IMAGES}/${image.filename}`
      : undefined;

    return this.testimonialService.create(dto, imagePath);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', testimonialUploadOptions),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imagePath = image
      ? `${UPLOAD_DIRECTORIES.CUSTOM_IMAGES}/${image.filename}`
      : undefined;

    return this.testimonialService.update(
      BigInt(id),
      dto,
      imagePath,
    );
  }

  @Patch(':id/status')
  statusUpdate(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.statusUpdate(BigInt(id));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.remove(BigInt(id));
  }
}
