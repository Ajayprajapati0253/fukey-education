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


import { FreeCourseService } from '../services/free-course.service';

import { CreateFreeCourseDto } from '../dto/create-free-course.dto';
import { UpdateFreeCourseDto } from '../dto/update-free-course.dto';
import { UpdateFreeCourseMoreInfoDto } from '../dto/update-free-course-more-info.dto';
import { FinishFreeCourseDto } from '../dto/finish-free-course.dto';
import { UpdateFreeCourseStatusDto } from '../dto/update-free-course-status.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/free-courses')
@UseGuards(AdminAuthGuard)
export class FreeCourseController {
  constructor(
    private readonly freeCourseService: FreeCourseService,
  ) {}

  // --------------------------------------------------
  // LIST
  // GET /api/v1/admin/free-courses
  // --------------------------------------------------

  @Get()
  async index(
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('date') date?: string,
    @Query('approve_status') approveStatus?: string,
    @Query('status') status?: string,
    @Query('instructor') instructor?: string,
    @Query('order_by') orderBy?: string,
    @Query('par_page') parPage?: string,
  ) {
    return this.freeCourseService.findAll({
      keyword,
      category: category
        ? Number(category)
        : undefined,
      date,
      approve_status: approveStatus,
      status,
      instructor: instructor
        ? Number(instructor)
        : undefined,
      order_by: orderBy
        ? Number(orderBy)
        : undefined,
      par_page: parPage
        ? Number(parPage)
        : undefined,
    });
  }

  // --------------------------------------------------
  // CREATE
  // POST /api/v1/admin/free-courses
  // --------------------------------------------------

  @Post()
  async create(
    @Body() dto: CreateFreeCourseDto,
  ) {
    return this.freeCourseService.createOrUpdate(dto);
  }

  // --------------------------------------------------
  // GET SINGLE COURSE
  // GET /api/v1/admin/free-courses/:id
  // --------------------------------------------------

  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.freeCourseService.findOne(id);
  }

  // --------------------------------------------------
  // UPDATE
  // PATCH /api/v1/admin/free-courses/:id
  // --------------------------------------------------

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseDto,
  ) {
    return this.freeCourseService.update(id, dto);
  }

  // --------------------------------------------------
  // MORE INFORMATION
  // PATCH /api/v1/admin/free-courses/:id/more-info
  // --------------------------------------------------

  @Patch(':id/more-info')
  async moreInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseMoreInfoDto,
  ) {
    dto.free_course_id = id;

    return this.freeCourseService.updateMoreInfo(dto);
  }

  // --------------------------------------------------
  // FINISH
  // PATCH /api/v1/admin/free-courses/:id/finish
  // --------------------------------------------------

  @Patch(':id/finish')
  async finish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinishFreeCourseDto,
  ) {
    return this.freeCourseService.finish(id, dto);
  }

  // --------------------------------------------------
  // STATUS / APPROVAL
  // PATCH /api/v1/admin/free-courses/:id/status
  // --------------------------------------------------

  @Patch(':id/status')
  async statusUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseStatusDto,
  ) {
    return this.freeCourseService.updateStatus(id, dto);
  }

  // --------------------------------------------------
  // DELETE
  // DELETE /api/v1/admin/free-courses/:id
  // --------------------------------------------------

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.freeCourseService.remove(id);
  }

  // --------------------------------------------------
  // BULK DELETE
  // POST /api/v1/admin/free-courses/bulk-delete
  // --------------------------------------------------

  @Post('bulk-delete')
  async bulkDelete(
    @Body('ids') ids: number[],
  ) {
    return this.freeCourseService.bulkDelete(ids);
  }
}