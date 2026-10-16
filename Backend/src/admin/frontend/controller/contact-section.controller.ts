import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { ContactSectionDto } from '../dto/contact-section.dto';
import { ContactSectionService } from '../services/contact-section.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/contact-section')
@UseGuards(AdminAuthGuard)
export class ContactSectionController {
  constructor(
    private readonly contactSectionService: ContactSectionService,
  ) {}

  @Get()
  async get() {
    return this.contactSectionService.get();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: ContactSectionDto,
  ) {
    return this.contactSectionService.update(Number(id), dto);
  }
}