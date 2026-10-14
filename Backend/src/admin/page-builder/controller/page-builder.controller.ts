
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { PageBuilderService } from '../services/page-builder.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';

@Controller('admin/page-builder')
export class PageBuilderController {
  constructor(
    private readonly pageBuilderService: PageBuilderService,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pageBuilderService.findAll(
      Number(page) || 1,
      Number(limit) || 15,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pageBuilderService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pageBuilderService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pageBuilderService.update(id, dto);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.pageBuilderService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pageBuilderService.remove(id);
  }
}
