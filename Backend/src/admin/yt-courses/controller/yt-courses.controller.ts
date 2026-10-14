import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { YtCoursesService } from '../services/yt-courses.service';
import { CreateYtCourseDto } from '../dto/create-yt-course.dto';
import { UpdateYtCourseDto } from '../dto/update-yt-course.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';


@Controller('admin/yt-courses')
@UseGuards(AdminAuthGuard)
export class YtCoursesController {
  constructor(private readonly ytCoursesService: YtCoursesService) {}

  @Post()
  create(@Body() dto: CreateYtCourseDto) {
    return this.ytCoursesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateYtCourseDto,
  ) {
    return this.ytCoursesService.update(id, dto);
  }

  @Patch(':id')
  patch(
    @Param('id') id: string,
    @Body() dto: UpdateYtCourseDto,
  ) {
    return this.ytCoursesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ytCoursesService.remove(id);
  }
}