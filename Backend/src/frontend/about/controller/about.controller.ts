import { Controller, Get, UseGuards } from '@nestjs/common';
import { AboutService } from '../services/about.service';


@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  async getAboutPage() {
    return this.aboutService.getAboutPage();
  }
}