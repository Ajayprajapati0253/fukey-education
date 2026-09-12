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
} from '@nestjs/common';

import { CareerService } from '../services/career.service';
import { CreateCareerDto } from '../dto/create-career.dto';
import { UpdateCareerDto } from '../dto/update-career.dto';

@Controller('admin/careers')
export class CareerController {
  constructor(
    private readonly careerService: CareerService,
  ) {}

  @Get()
  async findAll(
    @Query(
      'page',
      new ParseIntPipe({ optional: true }),
    )
    page = 1,

    @Query(
      'limit',
      new ParseIntPipe({ optional: true }),
    )
    limit = 20,

    @Query('keyword') keyword?: string,
    @Query('department') department?: string,
    @Query('location') location?: string,
    @Query('employment_type') employment_type?: string,
    @Query('status') status?: string,

    @Query(
      'order_by',
      new ParseIntPipe({ optional: true }),
    )
    order_by?: number,
  ) {
    return this.careerService.findAll(
      page,
      limit,
      keyword,
      department,
      location,
      employment_type,
      status,
      order_by,
    );
  }

  @Post()
  async create(@Body() dto: CreateCareerDto) {
    return this.careerService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.careerService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCareerDto,
  ) {
    return this.careerService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.careerService.remove(id);
  }

  @Patch(':id/status')
  async statusUpdate(
    @Param('id') id: string,
    @Body('status')
    status?: 'draft' | 'published' | 'closed',
  ) {
    return this.careerService.statusUpdate(
      id,
      status,
    );
  }
}