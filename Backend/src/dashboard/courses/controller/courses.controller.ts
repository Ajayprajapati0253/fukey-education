import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { EnrolledCoursesDto } from 'src/dashboard/dto/dashboard.dto';
import { CoursesService } from '../services/courses.service';


@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('enrolled-courses')
  enrolledCourses(@Req() req: any, @Query() query: EnrolledCoursesDto) {
    return this.coursesService.enrolledCourses(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 6,
    );
  }

  @Get('course-learning/:slug')
  courseLearning(@Req() req: any, @Param('slug') slug: string) {
    return this.coursesService.courseLearning(req.user.sub, slug);
  }

  @Get('learning-progress/:slug')
  learningProgress(@Req() req: any, @Param('slug') slug: string) {
    return this.coursesService.learningProgress(req.user.sub, slug);
  }
}