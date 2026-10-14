import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateFreeCourseLanguageDto } from '../dto/create-free-course-language.dto';
import { UpdateFreeCourseLanguageDto } from '../dto/update-free-course-language.dto';

@Injectable()
export class FreeCourseLanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    keyword?: string;
    status?: string;
    order_by?: string;
    page?: number;
    per_page?: number;
  }) {
    const {
      keyword,
      status,
      order_by,
      page = 1,
      per_page = 10,
    } = query;

    const where: any = {};

    if (keyword) {
      where.name = {
        contains: keyword,
      };
    }

    if (status !== undefined && status !== '') {
      if (status === 'true' || status === '1') {
        where.status = true;
      } else if (status === 'false' || status === '0') {
        where.status = false;
      }
    }

    const orderDirection = order_by === '1' ? 'asc' : 'desc';

    const skip = (page - 1) * per_page;

    const [languages, total] = await Promise.all([
      this.prisma.free_course_languages.findMany({
        where,
        orderBy: {
          id: orderDirection,
        },
        skip,
        take: per_page,
      }),

      this.prisma.free_course_languages.count({
        where,
      }),
    ]);

    return {
      status: 'success',
      data: languages.map((language) => ({
        ...language,
        id: Number(language.id),
      })),
      pagination: {
        current_page: page,
        per_page,
        total,
        last_page: Math.ceil(total / per_page),
      },
    };
  }

  async findOne(id: number) {
    const language =
      await this.prisma.free_course_languages.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!language) {
      throw new NotFoundException(
        'Free course language not found',
      );
    }

    return {
      status: 'success',
      data: {
        ...language,
        id: Number(language.id),
      },
    };
  }

  async create(dto: CreateFreeCourseLanguageDto) {
    const language =
      await this.prisma.free_course_languages.create({
        data: {
          name: dto.name,
          status: dto.status,
        },
      });

    return {
      status: 'success',
      message: 'Created successfully',
      data: {
        ...language,
        id: Number(language.id),
      },
    };
  }

  async update(
    id: number,
    dto: UpdateFreeCourseLanguageDto,
  ) {
    const existing =
      await this.prisma.free_course_languages.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Free course language not found',
      );
    }

    const language =
      await this.prisma.free_course_languages.update({
        where: {
          id: BigInt(id),
        },
        data: {
          name: dto.name,
          status: dto.status,
        },
      });

    return {
      status: 'success',
      message: 'Updated successfully',
      data: {
        ...language,
        id: Number(language.id),
      },
    };
  }

  async remove(id: number) {
    const existing =
      await this.prisma.free_course_languages.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Free course language not found',
      );
    }

    const selected =
      await this.prisma.free_course_selected_languages.findFirst({
        where: {
          language_id: BigInt(id),
        },
      });

    if (selected) {
      throw new BadRequestException(
        'Selected language can not be deleted it being used in courses',
      );
    }

    await this.prisma.free_course_languages.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }

  async statusUpdate(id: number) {
    const language =
      await this.prisma.free_course_languages.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!language) {
      throw new NotFoundException(
        'Free course language not found',
      );
    }

    const updated =
      await this.prisma.free_course_languages.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: !language.status,
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