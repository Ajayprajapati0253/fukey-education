import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
    UseInterceptors,

} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { GeneralSettingService } from '../services/general-setting.service';
import { UpdateGeneralSettingDto } from '../dto/update-general-setting.dto';
import { UpdateCustomPaginationDto } from '../dto/update-custom-pagination.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { UpdateVideoWatermarkDto } from '../dto/update-video-watermark.dto';
import { UpdateCookieConsentDto } from '../dto/update-cookie-consent.dto';
import { UpdateCopyrightTextDto } from '../dto/update-copyright-text.dto';
import { UpdateGoogleCaptchaDto } from '../dto/update-google-captcha.dto';
import { UpdateTawkChatDto } from '../dto/update-tawk-chat.dto';
import { UpdateGoogleTagmanagerDto } from '../dto/update-google-tagmanager.dto';
import { UpdateAwsCloudDto } from '../dto/update-aws-cloud.dto';
import { UpdateGoogleAnalyticDto } from '../dto/update-google-analytic.dto';
import { UpdateFacebookPixelDto } from '../dto/update-facebook-pixel.dto';
import { UpdateSocialLoginDto } from '../dto/update-social-login.dto';
import { UpdatePusherDto } from '../dto/update-pusher.dto';
import { UpdateSeoSettingDto } from '../dto/update-seo-setting.dto';
import { UpdateCustomCodeDto } from '../dto/update-custom-code.dto';
import { UpdateMaintenanceModeDto } from '../dto/update-maintenance-mode.dto';

@Controller('admin/general-setting')
@UseGuards(AdminAuthGuard)
export class GeneralSettingController {
  constructor(
    private readonly generalSettingService: GeneralSettingService,
  ) {}

  @Get()
  getGeneralSetting() {
    return this.generalSettingService.getGeneralSetting();
  }

  @Patch()
  updateGeneralSetting(
    @Body() dto: UpdateGeneralSettingDto,
  ) {
    return this.generalSettingService.updateGeneralSetting(dto);
  }

  @Get('pagination')
  getCustomPagination() {
    return this.generalSettingService.getCustomPagination();
  }

  @Patch('pagination')
  updateCustomPagination(
    @Body() dto: UpdateCustomPaginationDto,
  ) {
    return this.generalSettingService.updateCustomPagination(
      dto.ids,
      dto.quantities,
    );
  }

  @Patch('logo-favicon')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'preloader', maxCount: 1 },
  ]),
)
updateLogoFavicon(
  @UploadedFiles()
  files: {
    logo?: Express.Multer.File[];
    favicon?: Express.Multer.File[];
    preloader?: Express.Multer.File[];
  },
) {
  return this.generalSettingService.updateLogoFavicon(files);
}

@Patch('video-watermark')
@UseInterceptors(FileInterceptor('watermark_img'))
updateVideoWatermark(
  @Body() dto: UpdateVideoWatermarkDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  return this.generalSettingService.updateVideoWatermark(
    dto,
    file,
  );
}

@Patch('cookie-consent')
updateCookieConsent(
  @Body() dto: UpdateCookieConsentDto,
) {
  return this.generalSettingService.updateCookieConsent(dto);
}

@Patch('default-avatar')
@UseInterceptors(FileInterceptor('default_avatar'))
updateDefaultAvatar(
  @UploadedFile() file?: Express.Multer.File,
) {
  return this.generalSettingService.updateDefaultAvatar(file);
}

@Patch('breadcrumb')
@UseInterceptors(FileInterceptor('breadcrumb_image'))
updateBreadcrumb(
  @UploadedFile() file?: Express.Multer.File,
) {
  return this.generalSettingService.updateBreadcrumb(file);
}

@Patch('copyright-text')
updateCopyrightText(
  @Body() dto: UpdateCopyrightTextDto,
) {
  return this.generalSettingService.updateCopyrightText(dto);
}

@Patch('google-captcha')
updateGoogleCaptcha(
  @Body() dto: UpdateGoogleCaptchaDto,
) {
  return this.generalSettingService.updateGoogleCaptcha(dto);
}

@Patch('tawk-chat')
updateTawkChat(
  @Body() dto: UpdateTawkChatDto,
) {
  return this.generalSettingService.updateTawkChat(dto);
}

@Patch('google-tagmanager')
updateGoogleTagmanager(
  @Body() dto: UpdateGoogleTagmanagerDto,
) {
  return this.generalSettingService.updateGoogleTagmanager(dto);
}

@Patch('aws-cloud')
updateAwsCloud(
  @Body() dto: UpdateAwsCloudDto,
) {
  return this.generalSettingService.updateAwsCloud(dto);
}


@Patch('google-analytic')
updateGoogleAnalytic(
  @Body() dto: UpdateGoogleAnalyticDto,
) {
  return this.generalSettingService.updateGoogleAnalytic(dto);
}

@Patch('facebook-pixel')
updateFacebookPixel(
  @Body() dto: UpdateFacebookPixelDto,
) {
  return this.generalSettingService.updateFacebookPixel(dto);
}

@Patch('social-login')
updateSocialLogin(
  @Body() dto: UpdateSocialLoginDto,
) {
  return this.generalSettingService.updateSocialLogin(dto);
}

@Patch('pusher')
updatePusher(
  @Body() dto: UpdatePusherDto,
) {
  return this.generalSettingService.updatePusher(dto);
}

@Get('seo-setting')
getSeoSettings() {
  return this.generalSettingService.getSeoSettings();
}

@Patch('seo-setting/:id')
updateSeoSetting(
  @Param('id') id: string,
  @Body() dto: UpdateSeoSettingDto,
) {
  return this.generalSettingService.updateSeoSetting(id, dto);
}

@Post('cache-clear')
cacheClear() {
  return this.generalSettingService.cacheClear();
}

@Get('custom-code')
getCustomCode() {
  return this.generalSettingService.getCustomCode();
}

@Patch('custom-code')
updateCustomCode(
  @Body() dto: UpdateCustomCodeDto,
) {
  return this.generalSettingService.updateCustomCode(dto);
}

@Patch('maintenance-mode/status')
updateMaintenanceModeStatus() {
  return this.generalSettingService.updateMaintenanceModeStatus();
}

@Patch('maintenance-mode')
@UseInterceptors(FileInterceptor('maintenance_image'))
updateMaintenanceMode(
  @Body() dto: UpdateMaintenanceModeDto,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.generalSettingService.updateMaintenanceMode(
    dto,
    file,
  );
}

@Get('marketing-setting')
getMarketingSettings() {
  return this.generalSettingService.getMarketingSettings();
}

@Patch('marketing-setting')
updateMarketingSettings(
  @Body() body: Record<string, any>,
) {
  return this.generalSettingService.updateMarketingSettings(body);
}
}