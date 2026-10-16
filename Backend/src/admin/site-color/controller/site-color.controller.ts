
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { UpdateSiteColorDto } from '../dto/update-site-color.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { SiteColorService } from '../services/site-color.service';

// Replace with the actual admin guard path used in your project.

@Controller('admin/site-colors')
@UseGuards(AdminAuthGuard)
export class SiteColorController {
  constructor(
    private readonly siteColorService: SiteColorService,
  ) {}

  @Get()
  async index() {
    return this.siteColorService.findAll();
  }

  @Patch()
  async update(@Body() dto: UpdateSiteColorDto) {
    return this.siteColorService.update(dto);
  }
}
