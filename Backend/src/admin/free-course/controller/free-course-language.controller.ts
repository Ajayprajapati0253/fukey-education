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

import { CreateFreeCourseLanguageDto } from '../dto/create-free-course-language.dto';
import { UpdateFreeCourseLanguageDto } from '../dto/update-free-course-language.dto';
import { FreeCourseLanguageService } from '../services/free-course-language.service';

@Controller('admin/free-course-language')
@UseGuards(AdminAuthGuard)
export class FreeCourseLanguageController {
  constructor(
    private readonly service: FreeCourseLanguageService,
  ) {}

  @Get()
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('order_by') order_by?: string,
    @Query('page') page?: string,
    @Query('per_page') per_page?: string,
  ) {
    return this.service.findAll({
      keyword,
      status,
      order_by,
      page: page ? Number(page) : 1,
      per_page: per_page ? Number(per_page) : 10,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateFreeCourseLanguageDto,
  ) {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFreeCourseLanguageDto,
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