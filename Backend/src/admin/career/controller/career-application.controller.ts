import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';

import { CareerApplicationService } from '../services/career-application.service';
import { UpdateCareerApplicationStatusDto } from '../dto/update-career-application-status.dto';

@Controller('admin/career-applications')
export class CareerApplicationController {
  constructor(
    private readonly careerApplicationService: CareerApplicationService,
  ) {}

  @Get('career/:careerId')
  async findAll(
    @Param('careerId') careerId: string,

    @Query('page', new ParseIntPipe({ optional: true }))
    page = 1,

    @Query('limit', new ParseIntPipe({ optional: true }))
    limit = 20,

    @Query('status')
    status?: string,

    @Query('keyword')
    keyword?: string,
  ) {
    return this.careerApplicationService.findAll(
      careerId,
      page,
      limit,
      status,
      keyword,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCareerApplicationStatusDto,
  ) {
    return this.careerApplicationService.updateStatus(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.careerApplicationService.remove(id);
  }

  @Get(':id/resume')
async getResume(
  @Param('id') id: string,
) {
  return this.careerApplicationService.getResumeUrl(id);
}

}