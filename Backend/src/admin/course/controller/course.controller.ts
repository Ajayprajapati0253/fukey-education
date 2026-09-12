import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateCourseChapterDto } from '../dto/create-course-chapter.dto';
import { UpdateCourseChapterDto } from '../dto/update-course-chapter.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/courses')
@UseGuards(AdminAuthGuard)

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('date') date?: string,
    @Query('approve_status') approveStatus?: string,
    @Query('status') status?: string,
    @Query('instructor') instructor?: string,
    @Query('page') page?: string,
    @Query('par_page') parPage?: string,
    @Query('order_by') orderBy?: string,
  ) {
    const currentPage = page ? Number(page) : 1;

    const limit =
      parPage === 'all'
        ? 1000000
        : parPage
          ? Number(parPage)
          : 15;

    return this.courseService.findAll(
      keyword,
      category,
      date,
      approveStatus,
      status,
      instructor,
      currentPage,
      limit,
      orderBy,
    );
  }

  @Get('chapters/:id')
findChapterById(@Param('id', ParseIntPipe) id: number) {
  return this.courseService.findChapterById(id.toString());
}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Post(':courseId/chapters')
createChapter(
  @Param('courseId', ParseIntPipe) courseId: number,
  @Body() dto: CreateCourseChapterDto,
) {
  return this.courseService.createChapter({
    ...dto,
    course_id: courseId,
  });
}

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.updateBasic(id.toString(), dto);
  }

  @Patch('chapters/:id')
updateChapter(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateCourseChapterDto,
) {
  return this.courseService.updateChapter(id.toString(), dto.title);
}


  @Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.courseService.remove(id.toString());
}


@Delete('chapters/:id')
removeChapter(@Param('id', ParseIntPipe) id: number) {
  return this.courseService.removeChapter(id.toString());
}

}