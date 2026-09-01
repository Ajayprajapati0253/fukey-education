import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../user/auth/guards/jwt-auth.guard';
import { EnrolledCoursesDto } from '../dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('enrolled-courses')
  async enrolledCourses(
    @Req() req: any,
    @Query() query: EnrolledCoursesDto,
  ) {
    return this.dashboardService.enrolledCourses(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 6,
    );
  }

  @Get('wishlist-courses')
  async wishlistCourses(
    @Req() req: any,
    @Query() query: EnrolledCoursesDto,
  ) {
    return this.dashboardService.wishlistCourses(
      req.user.sub,
      query.page ?? 1,
      query.limit ?? 6,
    );
  }
}