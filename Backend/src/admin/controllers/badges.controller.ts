import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BadgesService } from '../services/badges.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/badges')
@UseGuards(AdminAuthGuard)
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  async getBadges() {
    const badges = await this.badgesService.getBadges();

    return {
      status: 'success',
      data: badges,
    };
  }

  @Post('registration')
  async registrationBadge(
    @Body()
    body: {
      name: string;
      from: number;
      to: number;
      key: string;
      image?: string;
    },
  ) {
    const badge = await this.badgesService.registrationBadge(body);

    return {
      status: 'success',
      message: 'Updated successfully',
      data: badge,
    };
  }
}