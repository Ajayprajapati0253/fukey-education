import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateFooterSettingDto } from '../dto/update-footer-setting.dto';

@Injectable()
export class FooterSettingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET FOOTER SETTING
   *
   * Laravel:
   * FooterSetting::first()
   */
  async findOne() {
    const footerSetting =
      await this.prisma.footer_settings.findFirst({
        orderBy: {
          id: 'asc',
        },
      });

    if (!footerSetting) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: this.serialize(footerSetting),
    };
  }

  /**
   * UPDATE / CREATE FOOTER SETTING
   *
   * Laravel:
   *
   * FooterSetting::updateOrCreate(
   *     ['id' => 1],
   *     $request->except(...)
   * );
   */
  async update(dto: UpdateFooterSettingDto) {
    const data = {
      footer_text: dto.footer_text,
      address: dto.address,
      phone: dto.phone,
      phone_one: dto.phone_one,
      phone_two: dto.phone_two,
      get_in_touch_text: dto.get_in_touch_text,
      google_play_link: dto.google_play_link,
      apple_store_link: dto.apple_store_link,
      logo: dto.logo,
      updated_at: new Date(),
    };

    const footerSetting =
      await this.prisma.footer_settings.upsert({
        where: {
          id: BigInt(1),
        },
        create: {
          id: BigInt(1),
          ...data,
        },
        update: data,
      });

    return {
      success: true,
      message: 'Updated successfully',
      data: this.serialize(footerSetting),
    };
  }

  private serialize(setting: any) {
    return {
      ...setting,
      id: setting.id.toString(),
    };
  }
}