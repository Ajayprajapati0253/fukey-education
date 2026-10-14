import {
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsletterSectionService } from '../services/newsletter-section.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';


@Controller('admin/newsletter-section')
@UseGuards(AdminAuthGuard)
export class NewsletterSectionController {
  constructor(
    private readonly newsletterSectionService: NewsletterSectionService,
  ) {}

  @Get()
  async index() {
    return this.newsletterSectionService.index();
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.newsletterSectionService.update(image);
  }
}