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
} from '@nestjs/common';

import { CourseSubCategoryService } from '../services/course-sub-category.service';
import { CreateCourseSubCategoryDto } from '../dto/create-course-sub-category.dto';
import { UpdateCourseSubCategoryDto } from '../dto/update-course-sub-category.dto';

@Controller('admin/course-sub-categories')
export class CourseSubCategoryController {
  constructor(
    private readonly courseSubCategoryService: CourseSubCategoryService,
  ) {}

  @Get()
  findAll(
    @Query('parent_id') parentId: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('par-page') parPage?: string,
    @Query('order_by') orderBy?: string,
  ) {
    const currentPage = page ? Number(page) : 1;

    const limit =
      parPage === 'all'
        ? 1000000
        : parPage
          ? Number(parPage)
          : 15;

    return this.courseSubCategoryService.findAll(
      parentId,
      keyword,
      status,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Post(':parentId')
  create(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body() dto: CreateCourseSubCategoryDto,
  ) {
    return this.courseSubCategoryService.create(
      parentId.toString(),
      dto,
    );
  }

  @Get(':parentId/:subCategoryId')
  findOne(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
  ) {
    return this.courseSubCategoryService.findOne(
      parentId.toString(),
      subCategoryId.toString(),
    );
  }

  @Patch(':parentId/:subCategoryId')
  update(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
    @Body() dto: UpdateCourseSubCategoryDto,
  ) {
    return this.courseSubCategoryService.update(
      parentId.toString(),
      subCategoryId.toString(),
      dto,
    );
  }

  @Delete(':parentId/:subCategoryId')
  remove(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Param('subCategoryId', ParseIntPipe)
    subCategoryId: number,
  ) {
    return this.courseSubCategoryService.remove(
      parentId.toString(),
      subCategoryId.toString(),
    );
  }

  @Patch(':id/status')
  statusUpdate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.courseSubCategoryService.statusUpdate(
      id.toString(),
    );
  }
}