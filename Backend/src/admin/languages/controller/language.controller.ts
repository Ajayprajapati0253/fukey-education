import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { LanguageDto } from '../dto/language.dto';
import { LanguageService } from '../services/language.service';

@Controller('admin/languages')
export class LanguageController {
  constructor(
    private readonly languageService: LanguageService,
  ) {}

  @Get()
  findAll(@Query('page') page?: string) {
    return this.languageService.findAll(
      page ? Number(page) : 1,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(BigInt(id));
  }

  @Post()
  create(@Body() dto: LanguageDto) {
    return this.languageService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: LanguageDto,
  ) {
    return this.languageService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(BigInt(id));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('column') column: string,
  ) {
    return this.languageService.updateStatus(
      BigInt(id),
      column,
    );
  }
}