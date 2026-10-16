import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

import { CreateFreeCourseSubCategoryDto } from '../dto/create-free-course-sub-category.dto';
import { UpdateFreeCourseSubCategoryDto } from '../dto/update-free-course-sub-category.dto';
import { FreeCourseSubCategoryService } from '../services/free-course-sub-category.service';

@Controller('admin/free-course-sub-category')
@UseGuards(AdminAuthGuard)
export class FreeCourseSubCategoryController {
  constructor(
    private readonly service: FreeCourseSubCategoryService,
  ) {}

  @Get(':parentId')
  async findAll(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('order_by') order_by?: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('par-page') par_page?: string,
    @Query('lang_code') lang_code?: string,
  ) {
    return this.service.findAll(parentId, {
      keyword,
      status,
      order_by,
      page: page ? Number(page) : 1,
      per_page: per_page ? Number(per_page) : 10,
      par_page,
      lang_code,
    });
  }

  @Get(':parentId/:subCategoryId')
  async findOne(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
    @Query('code') code?: string,
  ) {
    return this.service.findOne(
      parentId,
      subCategoryId,
      code,
    );
  }

  @Post(':parentId')
  async create(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body() dto: CreateFreeCourseSubCategoryDto,
  ) {
    return this.service.create(parentId, dto);
  }

  @Patch(':parentId/:subCategoryId')
  async update(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
    @Body() dto: UpdateFreeCourseSubCategoryDto,
  ) {
    return this.service.update(
      parentId,
      subCategoryId,
      dto,
    );
  }

  @Delete(':parentId/:subCategoryId')
  async remove(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
  ) {
    return this.service.remove(
      parentId,
      subCategoryId,
    );
  }

  @Patch(':id/status')
  async statusUpdate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.statusUpdate(id);
  }
}