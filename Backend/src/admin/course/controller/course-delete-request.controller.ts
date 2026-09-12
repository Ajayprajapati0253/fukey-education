import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CourseDeleteRequestService } from '../services/course-delete-request.service';
import { UpdateCourseDeleteRequestDto } from '../dto/update-course-delete-request.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/course-delete-requests')
@UseGuards(AdminAuthGuard)

export class CourseDeleteRequestController {
  constructor(
    private readonly courseDeleteRequestService: CourseDeleteRequestService,
  ) {}

  @Get()
  findAll() {
    return this.courseDeleteRequestService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDeleteRequestDto,
  ) {
    return this.courseDeleteRequestService.update(
      id.toString(),
      dto,
    );
  }
}