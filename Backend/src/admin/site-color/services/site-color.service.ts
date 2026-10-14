
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSiteColorDto } from '../dto/update-site-color.dto';

@Injectable()
export class SiteColorService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly colorKeys = [
    'primary_color',
    'secondary_color',
    'common_color_one',
    'common_color_two',
    'common_color_three',
    'common_color_four',
    'common_color_five',
  ] as const;

  async findAll() {
    const settings = await this.prisma.settings.findMany({
      where: {
        key: { in: [...this.colorKeys] },
      },
      select: {
        key: true,
        value: true,
      },
    });

    const result: Record<string, string | null> = {};

    for (const key of this.colorKeys) {
      result[key] = null;
    }

    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return {
      message: 'Site colors fetched successfully',
      data: result,
    };
  }

  async update(dto: UpdateSiteColorDto) {
    const values: Record<string, string> = {
      primary_color: dto.primary_color,
      secondary_color: dto.secondary_color,
      common_color_one: dto.common_color_one,
      common_color_two: dto.common_color_two,
      common_color_three: dto.common_color_three,
      common_color_four: dto.common_color_four,
      common_color_five: dto.common_color_five,
    };

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const key of this.colorKeys) {
          const existing = await tx.settings.findFirst({
            where: { key },
            select: { id: true },
          });

          if (existing) {
            await tx.settings.update({
              where: { id: existing.id },
              data: {
                value: values[key],
                updated_at: new Date(),
              },
            });
          } else {
            await tx.settings.create({
              data: {
                key,
                value: values[key],
                created_at: new Date(),
                updated_at: new Date(),
              },
            });
          }
        }
      });

      return {
        message: 'Site colors updated successfully',
        data: values,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update site colors',
      );
    }
  }
}
