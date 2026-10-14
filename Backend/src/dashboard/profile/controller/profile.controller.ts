
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';

import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateBioDto } from '../dto/update-bio.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateSocialLinksDto } from '../dto/update-social-links.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Patch('update-profile')
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(
      req.user.sub,
      dto,
    );
  }

  @Patch('update-bio')
  updateBio(
    @Req() req: any,
    @Body() dto: UpdateBioDto,
  ) {
    return this.profileService.updateBio(req.user.sub, dto);
  }

  @Patch('update-password')
  updatePassword(
    @Req() req: any,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.profileService.updatePassword(
      req.user.sub,
      dto,
    );
  }

  @Patch('update-address')
  updateAddress(
    @Req() req: any,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.profileService.updateAddress(
      req.user.sub,
      dto,
    );
  }

  @Patch('update-social-links')
  updateSocialLinks(
    @Req() req: any,
    @Body() dto: UpdateSocialLinksDto,
  ) {
    return this.profileService.updateSocialLinks(
      req.user.sub,
      dto,
    );
  }

  @Post('update-profile-picture')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  updateProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateProfilePicture(
      req.user.sub,
      file,
    );
  }
}
