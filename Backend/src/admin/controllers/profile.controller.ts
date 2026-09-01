import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { ProfileService } from '../services/profile.service';
import { UpdateAdminProfileDto } from '../dto/update-admin-profile.dto';
import { UpdateAdminPasswordDto } from '../dto/update-admin-password.dto';



@Controller('admin/profile')
@UseGuards(AdminAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  /**
   * GET /admin/profile
   */
  @Get()
  async getProfile(@Req() req: any) {
    return this.profileService.getProfile(
      req.admin.sub,
    );
  }

  /**
   * PATCH /admin/profile
   */
  @Patch()
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.profileService.updateProfile(
      req.admin.sub,
      dto,
    );
  }

  /**
   * PATCH /admin/profile/password
   */
  @Patch('password')
  async updatePassword(
    @Req() req: any,
    @Body() dto: UpdateAdminPasswordDto,
  ) {
    return this.profileService.updatePassword(
      req.admin.sub,
      dto,
    );
  }
}