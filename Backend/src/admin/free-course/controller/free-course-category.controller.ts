import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FreeCourseCategoryService } from '../services/free-course-category.service';
import { CreateFreeCourseCategoryDto } from '../dto/create-free-course-category.dto';
import { UpdateFreeCourseCategoryDto } from '../dto/update-free-course-category.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/free-course-categories')
@UseGuards(AdminAuthGuard)
export class FreeCourseCategoryController {
  constructor(
    private readonly service: FreeCourseCategoryService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() dto: CreateFreeCourseCategoryDto,
    @UploadedFile()
    icon?: Express.Multer.File,
  ) {
    return this.service.create(dto, icon);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFreeCourseCategoryDto,
    @UploadedFile()
    icon?: Express.Multer.File,
  ) {
    return this.service.update(
      id,
      dto,
      icon,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  async statusUpdate(
    @Param('id') id: string,
  ) {
    return this.service.statusUpdate(id);
  }
}