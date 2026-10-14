import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { FeaturedCourseSectionDto } from '../dto/featured-course-section.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { FeaturedCourseSectionService } from '../services/featured-course-section.service';

@Controller('admin/featured-course-section')
@UseGuards(AdminAuthGuard)
export class FeaturedCourseSectionController {
  constructor(
    private readonly featuredCourseSectionService: FeaturedCourseSectionService,
  ) {}

  @Get()
  async index() {
    return this.featuredCourseSectionService.index();
  }

  @Get('courses/:id')
  async coursesByCategory(@Param('id') id: string) {
    return this.featuredCourseSectionService.coursesByCategory(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: FeaturedCourseSectionDto,
  ) {
    return this.featuredCourseSectionService.update(Number(id), dto);
  }
}