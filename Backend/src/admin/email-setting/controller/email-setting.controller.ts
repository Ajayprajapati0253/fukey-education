import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';

import { EmailSettingService } from '../services/email-setting.service';
import { UpdateEmailConfigDto } from '../dto/update-email-config.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/email-setting')
@UseGuards(AdminAuthGuard)
export class EmailSettingController {
  constructor(
    private readonly emailSettingService: EmailSettingService,
  ) {}

  /**
   * Get email configuration
   */
  
  @Get('config')
  getEmailConfig() {
    return this.emailSettingService.getEmailConfig();
  }

  /**
   * Update email configuration
   */

  @Patch('config')
  updateEmailConfig(
    @Body() dto: UpdateEmailConfigDto,
  ) {
    return this.emailSettingService.updateEmailConfig(dto);
  }

  /**
   * Get all email templates
   */

  @Get('templates')
  getEmailTemplates() {
    return this.emailSettingService.getEmailTemplates();
  }

  /**
   * Get single email template
   */
  @Get('templates/:id')
  getEmailTemplate(@Param('id') id: string) {
    return this.emailSettingService.getEmailTemplate(id);
  }

  /**
   * Update email template
   */
  @Put('templates/:id')
  updateEmailTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return this.emailSettingService.updateEmailTemplate(
      id,
      dto,
    );
  }
}