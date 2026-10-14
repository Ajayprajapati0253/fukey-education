import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';

import { YtCoursesService } from '../services/yt-courses.service';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';

@Controller('yt-courses')
@UseGuards(JwtAuthGuard)

export class YtCoursesController {
  constructor(
    private readonly ytCoursesService: YtCoursesService,
  ) {}

  /**
   * GET /yt-courses?page=1&limit=10
   */
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ) {
    return this.ytCoursesService.findAll(page, limit);
  }

  /**
   * GET /yt-courses/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ytCoursesService.findOne(id);
  }
}