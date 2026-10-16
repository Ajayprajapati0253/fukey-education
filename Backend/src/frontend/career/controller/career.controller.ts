import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { CareerService } from '../services/career.service';

@Controller('careers')
export class CareerController {
  constructor(
    private readonly careerService: CareerService,
  ) {}

  /**
   * GET /careers
   */
  @Get()
  findAll() {
    return this.careerService.findAll();
  }

  /**
   * GET /careers/:slug
   */
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
  ) {
    return this.careerService.findBySlug(slug);
  }
}