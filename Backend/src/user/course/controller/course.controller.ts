import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { CourseService } from '../services/course.service';
import { AllCoursesDto } from '../dto/all-courses.dto';

@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Get()
  allCourses(
    @Query() dto: AllCoursesDto,
  ) {
    return this.courseService.allCourses(dto);
  }
}