
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SectionSettingService } from '../services/section-setting.service';
import { UpdateSectionSettingDto } from '../dto/update-section-setting.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

// Replace this import with the actual admin authentication/permission
// guard used in your project.

@Controller('admin/section-settings')
@UseGuards(AdminAuthGuard)
export class SectionSettingController {
  constructor(
    private readonly sectionSettingService: SectionSettingService,
  ) {}

  @Get()
  findOne() {
    return this.sectionSettingService.findOne();
  }

  @Patch()
  update(@Body() dto: UpdateSectionSettingDto) {
    return this.sectionSettingService.update(dto);
  }
}
