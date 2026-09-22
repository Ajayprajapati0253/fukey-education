import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { FooterSettingService } from '../services/footer-setting.service';
import { UpdateFooterSettingDto } from '../dto/update-footer-setting.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/footer-setting')
@UseGuards(AdminAuthGuard)
export class FooterSettingController {
  constructor(
    private readonly footerSettingService: FooterSettingService,
  ) {}

  @Get()
  async index() {
    return this.footerSettingService.findOne();
  }

  @Patch()
  async update(
    @Body() dto: UpdateFooterSettingDto,
  ) {
    return this.footerSettingService.update(dto);
  }
}