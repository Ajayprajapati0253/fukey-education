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

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

import { CreateFreeCourseLevelDto } from '../dto/create-free-course-level.dto';
import { UpdateFreeCourseLevelDto } from '../dto/update-free-course-level.dto';
import { FreeCourseLevelService } from '../services/free-course-level.service';

@Controller('admin/free-course-level')
@UseGuards(AdminAuthGuard)
export class FreeCourseLevelController {
  constructor(
    private readonly service: FreeCourseLevelService,
  ) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('order_by') order_by?: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
    @Query('par-page') par_page?: string,
    @Query('lang_code') lang_code?: string,
  ) {
    return this.service.findAll({
      keyword,
      status,
      order_by,
      page: page ? Number(page) : 1,
      per_page: per_page ? Number(per_page) : 10,
      par_page,
      lang_code,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang_code') lang_code?: string,
  ) {
    return this.service.findOne(id, lang_code);
  }

  @Post()
  async create(
    @Body() dto: CreateFreeCourseLevelDto,
  ) {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseLevelDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  async statusUpdate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.statusUpdate(id);
  }
}