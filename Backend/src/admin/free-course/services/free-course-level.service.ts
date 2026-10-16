import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateFreeCourseLevelDto } from '../dto/create-free-course-level.dto';
import { UpdateFreeCourseLevelDto } from '../dto/update-free-course-level.dto';

@Injectable()
export class FreeCourseLevelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    keyword?: string;
    status?: string;
    order_by?: string;
    page?: number;
    per_page?: number;
    par_page?: string;
    lang_code?: string;
  }) {
    const {
      keyword,
      status,
      order_by,
      page = 1,
      per_page = 10,
      par_page,
      lang_code,
    } = query;

    const where: any = {};

    if (status !== undefined && status !== '') {
      if (status === '1' || status === 'true') {
        where.status = true;
      } else if (status === '0' || status === 'false') {
        where.status = false;
      }
    }

    const orderDirection = order_by === '1' ? 'asc' : 'desc';

    // Laravel searches keyword inside translations.name
    if (keyword) {
      const matchingTranslations =
        await this.prisma.free_course_level_translations.findMany({
          where: {
            name: {
              contains: keyword,
            },
            ...(lang_code ? { lang_code } : {}),
          },
          select: {
            free_course_level_id: true,
          },
        });

      const levelIds = matchingTranslations.map(
        (item) => item.free_course_level_id,
      );

      where.id = {
        in: levelIds,
      };
    }

    const levels =
      par_page === 'all'
        ? await this.prisma.free_course_levels.findMany({
            where,
            orderBy: {
              id: orderDirection,
            },
          })
        : await this.prisma.free_course_levels.findMany({
            where,
            orderBy: {
              id: orderDirection,
            },
            skip: (page - 1) * per_page,
            take: per_page,
          });

    const levelIds = levels.map((level) => level.id);

    const translations =
      levelIds.length > 0
        ? await this.prisma.free_course_level_translations.findMany({
            where: {
              free_course_level_id: {
                in: levelIds,
              },
              ...(lang_code ? { lang_code } : {}),
            },
            orderBy: {
              id: 'asc',
            },
          })
        : [];

    const data = levels.map((level) => ({
      ...level,
      id: Number(level.id),
      translations: translations
        .filter(
          (translation) =>
            translation.free_course_level_id === level.id,
        )
        .map((translation) => ({
          ...translation,
          id: Number(translation.id),
          free_course_level_id: Number(
            translation.free_course_level_id,
          ),
        })),
    }));

    if (par_page === 'all') {
      return {
        status: 'success',
        data,
      };
    }

    const total =
      await this.prisma.free_course_levels.count({
        where,
      });

    return {
      status: 'success',
      data,
      pagination: {
        current_page: page,
        per_page,
        total,
        last_page: Math.ceil(total / per_page),
      },
    };
  }

  async findOne(id: number, lang_code?: string) {
    const level =
      await this.prisma.free_course_levels.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!level) {
      throw new NotFoundException(
        'Free course level not found',
      );
    }

    const translations =
      await this.prisma.free_course_level_translations.findMany({
        where: {
          free_course_level_id: BigInt(id),
          ...(lang_code ? { lang_code } : {}),
        },
        orderBy: {
          id: 'asc',
        },
      });

    return {
      status: 'success',
      data: {
        ...level,
        id: Number(level.id),
        translations: translations.map((translation) => ({
          ...translation,
          id: Number(translation.id),
          free_course_level_id: Number(
            translation.free_course_level_id,
          ),
        })),
      },
    };
  }

  async create(dto: CreateFreeCourseLevelDto) {
    const existing =
      await this.prisma.free_course_levels.findFirst({
        where: {
          slug: dto.slug,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'The slug field must be unique',
      );
    }

    const level =
      await this.prisma.free_course_levels.create({
        data: {
          slug: dto.slug,
          status: dto.status,
        },
      });

    return {
      status: 'success',
      message: 'Created successfully',
      data: {
        ...level,
        id: Number(level.id),
      },
    };
  }

  async update(
    id: number,
    dto: UpdateFreeCourseLevelDto,
  ) {
    const existing =
      await this.prisma.free_course_levels.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Free course level not found',
      );
    }

    const level =
      await this.prisma.free_course_levels.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: dto.status,
        },
      });

    return {
      status: 'success',
      message: 'Updated successfully',
      data: {
        ...level,
        id: Number(level.id),
      },
    };
  }

  async remove(id: number) {
    const existing =
      await this.prisma.free_course_levels.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Free course level not found',
      );
    }

    const selected =
      await this.prisma.free_course_selected_levels.findFirst({
        where: {
          level_id: BigInt(id),
        },
      });

    if (selected) {
      throw new BadRequestException(
        'Can not delete this level because it being used by courses',
      );
    }

    await this.prisma.$transaction([
      this.prisma.free_course_level_translations.deleteMany({
        where: {
          free_course_level_id: BigInt(id),
        },
      }),

      this.prisma.free_course_levels.delete({
        where: {
          id: BigInt(id),
        },
      }),
    ]);

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }

  async statusUpdate(id: number) {
    const level =
      await this.prisma.free_course_levels.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!level) {
      throw new NotFoundException(
        'Free course level not found',
      );
    }

    const updated =
      await this.prisma.free_course_levels.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: !level.status,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updated,
        id: Number(updated.id),
      },
    };
  }
}