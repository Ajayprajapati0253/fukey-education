import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';



@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
  ) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('me')
  async me(@CurrentAdmin() admin: any) {
    return {
      admin,
    };
  }

@UseGuards(AdminAuthGuard)
@Post('reset-password')
async resetPassword(
  @CurrentAdmin() admin: any,
  @Body() dto: ResetPasswordDto,
) {
  return this.adminAuthService.resetPassword(
    admin.sub,
    dto,
  );
}

  @Post('logout')
  async logout() {
    return {
      message: 'Logged out successfully.',
    };
  }


}