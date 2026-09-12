import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/settings')
@UseGuards(AdminAuthGuard)
export class SettingController {

  @Get()
  async getSettings() {
    return {
      message: 'Settings page data',
    };
  }
}