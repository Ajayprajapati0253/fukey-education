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

import { CourseLevelService } from '../services/course-level.service';
import { CreateCourseLevelDto } from '../dto/create-course-level.dto';
import { UpdateCourseLevelDto } from '../dto/update-course-level.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/course-levels')
    @UseGuards(AdminAuthGuard)

export class CourseLevelController {
  constructor(
    private readonly courseLevelService: CourseLevelService,
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

    return this.courseLevelService.findAll(
      keyword,
      status,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Post()
  create(@Body() dto: CreateCourseLevelDto) {
    return this.courseLevelService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseLevelService.findOne(id.toString());
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseLevelDto,
  ) {
    return this.courseLevelService.update(id.toString(), dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseLevelService.remove(id.toString());
  }

  @Patch(':id/status')
  statusUpdate(@Param('id', ParseIntPipe) id: number) {
    return this.courseLevelService.statusUpdate(id.toString());
  }
}