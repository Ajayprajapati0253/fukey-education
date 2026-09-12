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

import { CourseLanguageService } from '../services/course-language.service';
import { CreateCourseLanguageDto } from '../dto/create-course-language.dto';
import { UpdateCourseLanguageDto } from '../dto/update-course-language.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/course-languages')
@UseGuards(AdminAuthGuard)
export class CourseLanguageController {
  constructor(
    private readonly courseLanguageService: CourseLanguageService,
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

    return this.courseLanguageService.findAll(
      keyword,
      status,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Post()
  create(@Body() dto: CreateCourseLanguageDto) {
    return this.courseLanguageService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseLanguageService.findOne(id.toString());
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseLanguageDto,
  ) {
    return this.courseLanguageService.update(
      id.toString(),
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseLanguageService.remove(id.toString());
  }

  @Patch(':id/status')
  statusUpdate(@Param('id', ParseIntPipe) id: number) {
    return this.courseLanguageService.statusUpdate(
      id.toString(),
    );
  }
}