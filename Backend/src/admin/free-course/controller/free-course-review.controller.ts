import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

import { UpdateFreeCourseReviewDto } from '../dto/update-free-course-review.dto';
import { FreeCourseReviewService } from '../services/free-course-review.service';

@Controller('admin/free-course-review')
@UseGuards(AdminAuthGuard)
export class FreeCourseReviewController {
  constructor(
    private readonly service: FreeCourseReviewService,
  ) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('order_by') order_by?: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('par-page') par_page?: string,
  ) {
    return this.service.findAll({
      keyword,
      status,
      order_by,
      page: page ? Number(page) : 1,
      per_page: per_page ? Number(per_page) : 10,
      par_page,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseReviewDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }
}