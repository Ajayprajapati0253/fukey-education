import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

import { UpdateFreeCourseDeleteRequestDto } from '../dto/update-free-course-delete-request.dto';
import { FreeCourseDeleteRequestService } from '../services/free-course-delete-request.service';

@Controller('admin/free-course-delete-requests')
@UseGuards(AdminAuthGuard)
export class FreeCourseDeleteRequestController {
  constructor(
    private readonly service: FreeCourseDeleteRequestService,
  ) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseDeleteRequestDto,
  ) {
    return this.service.update(id, dto);
  }
}