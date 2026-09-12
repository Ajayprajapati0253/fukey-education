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
import { CourseCategoryService } from '../services/course-category.service';
import { CreateCourseCategoryDto } from '../dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from '../dto/update-course-category.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/course-categories')
@UseGuards(AdminAuthGuard)

export class CourseCategoryController {
  constructor(
    private readonly courseCategoryService: CourseCategoryService,
  ) {}

  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('parent_id') parentId?: string,
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

    return this.courseCategoryService.findAll(
      keyword,
      parentId,
      status,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Post()
  create(@Body() dto: CreateCourseCategoryDto) {
    return this.courseCategoryService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseCategoryDto,
  ) {
    return this.courseCategoryService.update(id.toString(), dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoryService.remove(id.toString());
  }

  @Patch(':id/status')
  statusUpdate(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoryService.statusUpdate(id.toString());
  }
}