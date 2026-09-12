import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';

import { CourseReviewService } from '../services/course-review.service';
import { UpdateCourseReviewDto } from '../dto/update-course-review.dto';

@Controller('admin/course-reviews')
export class CourseReviewController {
  constructor(
    private readonly courseReviewService: CourseReviewService,
  ) {}

  @Get()
  findAll(
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

    return this.courseReviewService.findAll(
      keyword,
      status,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseReviewService.findOne(id.toString());
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseReviewDto,
  ) {
    return this.courseReviewService.update(
      id.toString(),
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseReviewService.remove(id.toString());
  }
}