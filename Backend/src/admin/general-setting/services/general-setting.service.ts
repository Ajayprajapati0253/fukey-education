import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateGeneralSettingDto } from '../dto/update-general-setting.dto';
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

@Injectable()
export class GeneralSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getGeneralSetting() {
    const keys = [
      'app_name',
      'timezone',
      'is_queable',
      'site_address',
      'site_email',
      'header_topbar_status',
      'header_social_status',
      'cursor_dot_status',
      'preloader_status',
      'live_mail_send',
    ];

    const settings = await this.prisma.settings.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    const data: Record<string, string> = {};

    for (const setting of settings) {
      data[setting.key] = setting.value;
    }

    return {
      success: true,
      data,
    };
  }

  async updateGeneralSetting(dto: UpdateGeneralSettingDto) {
    const settings: Record<string, string | undefined> = {
      app_name: dto.app_name,
      timezone: dto.timezone,
      is_queable: dto.is_queable,
      site_address: dto.site_address,
      site_email: dto.site_email,
      header_topbar_status: dto.header_topbar_status,
      header_social_status: dto.header_social_status,
      cursor_dot_status: dto.cursor_dot_status,
      preloader_status: dto.preloader_status,
      live_mail_send: dto.live_mail_send,
    };

    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        await this.prisma.settings.updateMany({
          where: { key },
          data: { value },
        });
      }
    }

    return {
      success: true,
      message: 'Update Successfully',
    };
  }

  async getCustomPagination() {
    const pagination =
      await this.prisma.custom_paginations.findMany({
        orderBy: {
          id: 'asc',
        },
      });

    return {
      success: true,
      data: pagination.map((item) => ({
        ...item,
        id: item.id.toString(),
      })),
    };
  }

  async updateCustomPagination(
    ids: string[],
    quantities: number[],
  ) {
    if (ids.length !== quantities.length) {
      return {
        success: false,
        message: 'Invalid pagination data',
      };
    }

    for (let i = 0; i < ids.length; i++) {
      await this.prisma.custom_paginations.update({
        where: {
          id: BigInt(ids[i]),
        },
        data: {
          item_qty: quantities[i],
        },
      });
    }

    return {
      success: true,
      message: 'Update Successfully',
    };
  }

  async updateLogoFavicon(files: {
  logo?: Express.Multer.File[];
  favicon?: Express.Multer.File[];
  preloader?: Express.Multer.File[];
}) {
  const updates: Record<string, string> = {};

  if (files.logo?.[0]) {
    updates.logo = files.logo[0].filename;
  }

  if (files.favicon?.[0]) {
    updates.favicon = files.favicon[0].filename;
  }

  if (files.preloader?.[0]) {
    updates.preloader = files.preloader[0].filename;
  }

  for (const [key, value] of Object.entries(updates)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
    data: updates,
  };
}

async updateVideoWatermark(
  dto: UpdateVideoWatermarkDto,
  file?: Express.Multer.File,
) {
  if (file) {
    await this.prisma.settings.updateMany({
      where: {
        key: 'watermark_img',
      },
      data: {
        value: file.filename,
      },
    });
  }

  await this.prisma.settings.updateMany({
    where: {
      key: 'opacity',
    },
    data: {
      value: dto.opacity,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'position',
    },
    data: {
      value: dto.position,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'max_width',
    },
    data: {
      value: dto.max_width,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'watermark_status',
    },
    data: {
      value: dto.watermark_status ?? '',
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateCookieConsent(dto: UpdateCookieConsentDto) {
  const settings: Record<string, string> = {
    cookie_status: dto.cookie_status,
    border: dto.border,
    corners: dto.corners,
    background_color: dto.background_color,
    text_color: dto.text_color,
    border_color: dto.border_color,
    btn_bg_color: dto.btn_bg_color,
    btn_text_color: dto.btn_text_color,
    link_text: dto.link_text,
    btn_text: dto.btn_text,
    message: dto.message,
    link: dto.link,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateDefaultAvatar(
  file?: Express.Multer.File,
) {
  if (file) {
    await this.prisma.settings.updateMany({
      where: {
        key: 'default_avatar',
      },
      data: {
        value: file.filename,
      },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateBreadcrumb(
  file?: Express.Multer.File,
) {
  if (file) {
    await this.prisma.settings.updateMany({
      where: {
        key: 'breadcrumb_image',
      },
      data: {
        value: file.filename,
      },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateCopyrightText(
  dto: UpdateCopyrightTextDto,
) {
  await this.prisma.settings.updateMany({
    where: {
      key: 'copyright_text',
    },
    data: {
      value: dto.copyright_text,
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateGoogleCaptcha(
  dto: UpdateGoogleCaptchaDto,
) {
  const settings: Record<string, string> = {
    recaptcha_site_key: dto.recaptcha_site_key,
    recaptcha_secret_key: dto.recaptcha_secret_key,
    recaptcha_status: dto.recaptcha_status,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateTawkChat(dto: UpdateTawkChatDto) {
  let embedUrl: string;

  if (dto.tawk_chat_link.includes('embed.tawk.to')) {
    embedUrl = dto.tawk_chat_link;
  } else if (dto.tawk_chat_link.includes('tawk.to/chat')) {
    embedUrl = dto.tawk_chat_link.replace(
      'tawk.to/chat',
      'embed.tawk.to',
    );
  } else {
    embedUrl = `https://embed.tawk.to/${dto.tawk_chat_link}`;
  }

  await this.prisma.settings.updateMany({
    where: {
      key: 'tawk_status',
    },
    data: {
      value: dto.tawk_status,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'tawk_chat_link',
    },
    data: {
      value: embedUrl,
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateGoogleTagmanager(
  dto: UpdateGoogleTagmanagerDto,
) {
  await this.prisma.settings.updateMany({
    where: {
      key: 'google_tagmanager_status',
    },
    data: {
      value: dto.google_tagmanager_status,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'google_tagmanager_id',
    },
    data: {
      value: dto.google_tagmanager_id,
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateAwsCloud(dto: UpdateAwsCloudDto) {
  const settings: Record<string, string> = {
    aws_access_id: dto.aws_access_id,
    aws_secret_key: dto.aws_secret_key,
    aws_bucket: dto.aws_bucket,
    aws_region: dto.aws_region,
    aws_status: dto.aws_status,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}


async updateGoogleAnalytic(dto: UpdateGoogleAnalyticDto) {
  const settings: Record<string, string> = {
    google_analytic_status: dto.google_analytic_status,
    google_analytic_id: dto.google_analytic_id,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updateFacebookPixel(dto: UpdateFacebookPixelDto) {
  const settings: Record<string, string> = {
    pixel_status: dto.pixel_status,
    pixel_app_id: dto.pixel_app_id,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}


async updateSocialLogin(dto: UpdateSocialLoginDto) {
  const settings: Record<string, string> = {
    google_login_status: dto.google_login_status,
    gmail_client_id: dto.gmail_client_id,
    gmail_secret_id: dto.gmail_secret_id,
  };

  if (dto.gmail_redirect_url !== undefined) {
    settings.gmail_redirect_url = dto.gmail_redirect_url;
  }

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async updatePusher(dto: UpdatePusherDto) {
  const settings: Record<string, string> = {
    pusher_status: dto.pusher_status,
    pusher_app_id: dto.pusher_app_id,
    pusher_app_key: dto.pusher_app_key,
    pusher_app_secret: dto.pusher_app_secret,
    pusher_app_cluster: dto.pusher_app_cluster,
  };

  for (const [key, value] of Object.entries(settings)) {
    await this.prisma.settings.updateMany({
      where: { key },
      data: { value },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async getSeoSettings() {
  return this.prisma.seo_settings.findMany();
}

async updateSeoSetting(
  id: string,
  dto: UpdateSeoSettingDto,
) {
  const seoSetting = await this.prisma.seo_settings.findUnique({
    where: {
      id: BigInt(id),
    },
  });

  if (!seoSetting) {
    return {
      success: false,
      message: 'SEO setting not found',
    };
  }

  await this.prisma.seo_settings.update({
    where: {
      id: BigInt(id),
    },
    data: {
      seo_title: dto.seo_title,
      seo_description: dto.seo_description,
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async cacheClear() {

  return {
    success: true,
    message: 'Cache cleared successfully',
  };
}

async getCustomCode() {
  let customCode = await this.prisma.custom_codes.findFirst();

  if (!customCode) {
    customCode = await this.prisma.custom_codes.create({
      data: {
        css: '/* write your css code here without the style tag */',
        javascript: '//write your javascript here without the script tag',
        header_javascript:
          '//write your javascript here without the script tag',
      },
    });
  }

  return customCode;
}

async updateCustomCode(dto: UpdateCustomCodeDto) {
  let customCode = await this.prisma.custom_codes.findFirst();

  if (!customCode) {
    customCode = await this.prisma.custom_codes.create({
      data: {
        css: dto.css ?? null,
        javascript: dto.javascript ?? null,
        header_javascript: dto.header_javascript ?? null,
      },
    });
  } else {
    await this.prisma.custom_codes.update({
      where: {
        id: customCode.id,
      },
      data: {
        ...(dto.css !== undefined && {
          css: dto.css,
        }),
        ...(dto.javascript !== undefined && {
          javascript: dto.javascript,
        }),
        ...(dto.header_javascript !== undefined && {
          header_javascript: dto.header_javascript,
        }),
      },
    });
  }

  return {
    success: true,
    message: 'Updated Successfully',
  };
}

async updateMaintenanceModeStatus() {
  const setting = await this.prisma.settings.findFirst({
    where: {
      key: 'maintenance_mode',
    },
  });

  const currentStatus = Number(setting?.value ?? 0);

  const status = currentStatus === 1 ? '0' : '1';

  await this.prisma.settings.updateMany({
    where: {
      key: 'maintenance_mode',
    },
    data: {
      value: status,
    },
  });

  return {
    success: true,
    message: 'Updated Successfully',
  };
}

async updateMaintenanceMode(
  dto: UpdateMaintenanceModeDto,
  file?: Express.Multer.File,
) {
  if (file) {
    await this.prisma.settings.updateMany({
      where: {
        key: 'maintenance_image',
      },
      data: {
        value: file.filename,
      },
    });
  }

  await this.prisma.settings.updateMany({
    where: {
      key: 'maintenance_title',
    },
    data: {
      value: dto.maintenance_title,
    },
  });

  await this.prisma.settings.updateMany({
    where: {
      key: 'maintenance_description',
    },
    data: {
      value: dto.maintenance_description,
    },
  });

  return {
    success: true,
    message: 'Update Successfully',
  };
}

async getMarketingSettings() {
  return this.prisma.marketing_settings.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}

async updateMarketingSettings(
  data: Record<string, any>,
) {
  for (const [key, value] of Object.entries(data)) {
    if (key === '_token') {
      continue;
    }

    await this.prisma.marketing_settings.updateMany({
      where: {
        key,
      },
      data: {
        value: String(value),
      },
    });
  }

  return {
    success: true,
    message: 'Update Successfully',
  };
}
}