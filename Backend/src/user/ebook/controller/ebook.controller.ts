import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { EbookQueryDto } from '../dto/ebook-query.dto';
import { EbookService } from '../services/ebook.service';

@Controller('api/v1/ebooks')
export class EbookController {
  constructor(
    private readonly ebookApiService: EbookService,
  ) {}

  /**
   * GET /api/v1/ebooks
   */
  @Get()
  async index(@Query() dto: EbookQueryDto) {
    return this.ebookApiService.index(dto);
  }

  /**
   * GET /api/v1/ebooks/filters
   */
  @Get('filters')
  async filters() {
    return this.ebookApiService.filters();
  }

  /**
   * GET /api/v1/ebooks/:slug
   */
  @Get(':slug')
  async show(@Param('slug') slug: string) {
    return this.ebookApiService.show(slug);
  }
}