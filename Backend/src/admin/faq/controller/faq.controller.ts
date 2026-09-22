import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FaqService } from '../services/faq.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/faqs')
@UseGuards(AdminAuthGuard)
export class FaqController {
  constructor(
    private readonly faqService: FaqService,
  ) {}

  /**
   * GET /admin/faqs
   */
  @Get()
  async index(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lang_code') langCode?: string,
  ) {
    const currentPage = page
      ? Number(page)
      : 1;

    const perPage = limit
      ? Number(limit)
      : 15;

    return this.faqService.findAll(
      currentPage,
      perPage,
      langCode ?? 'en',
    );
  }

  /**
   * GET /admin/faqs/:id
   */
  @Get(':id')
  async show(
    @Param('id') id: string,
    @Query('lang_code') langCode?: string,
  ) {
    return this.faqService.findOne(
      id,
      langCode ?? 'en',
    );
  }

  /**
   * POST /admin/faqs
   */
  @Post()
  async store(
    @Body() dto: CreateFaqDto,
  ) {
    return this.faqService.create(dto);
  }

  /**
   * PUT /admin/faqs/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.update(id, dto);
  }

  /**
   * PATCH /admin/faqs/:id/status
   */
  @Patch(':id/status')
  async statusUpdate(
    @Param('id') id: string,
  ) {
    return this.faqService.statusUpdate(id);
  }

  /**
   * DELETE /admin/faqs/:id
   */
  @Delete(':id')
  async destroy(
    @Param('id') id: string,
  ) {
    return this.faqService.remove(id);
  }
}