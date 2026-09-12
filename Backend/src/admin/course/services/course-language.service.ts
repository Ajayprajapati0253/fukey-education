import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseLanguageDto } from '../dto/create-course-language.dto';
import { UpdateCourseLanguageDto } from '../dto/update-course-language.dto';

@Injectable()
export class CourseLanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    keyword?: string,
    status?: string,
    page = 1,
    limit = 15,
    orderBy?: string,
  ) {
    const where: any = {};

    if (keyword) {
      where.name = {
        contains: keyword,
      };
    }

    if (status !== undefined && status !== '') {
      where.status = status === '1' || status === 'true';
    }

    const order = orderBy === '1' ? 'asc' : 'desc';

    const [total, languages] = await this.prisma.$transaction([
      this.prisma.course_languages.count({
        where,
      }),

      this.prisma.course_languages.findMany({
        where,
        orderBy: {
          id: order,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      status: 'success',
      data: languages.map((language) => ({
        ...language,
        id: language.id.toString(),
      })),
      meta: {
        current_page: page,
        last_page: total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async create(dto: CreateCourseLanguageDto) {
    const language = await this.prisma.course_languages.create({
      data: {
        name: dto.name,
        status: dto.status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course language created successfully',
      data: {
        ...language,
        id: language.id.toString(),
      },
    };
  }

  async findOne(id: string) {
    const languageId = BigInt(id);

    const language = await this.prisma.course_languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!language) {
      throw new NotFoundException('Course language not found');
    }

    return {
      status: 'success',
      data: {
        ...language,
        id: language.id.toString(),
      },
    };
  }

  async update(id: string, dto: UpdateCourseLanguageDto) {
    const languageId = BigInt(id);

    const language = await this.prisma.course_languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!language) {
      throw new NotFoundException('Course language not found');
    }

    const updatedLanguage =
      await this.prisma.course_languages.update({
        where: {
          id: languageId,
        },
        data: {
          name: dto.name,
          status: dto.status,
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Course language updated successfully',
      data: {
        ...updatedLanguage,
        id: updatedLanguage.id.toString(),
      },
    };
  }

  async remove(id: string) {
    const languageId = BigInt(id);

    const language = await this.prisma.course_languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!language) {
      throw new NotFoundException('Course language not found');
    }

    const isUsed =
      await this.prisma.course_selected_languages.findFirst({
        where: {
          language_id: languageId,
        },
      });

    if (isUsed) {
      throw new ConflictException(
        'Selected language can not be deleted it being used in courses',
      );
    }

    await this.prisma.course_languages.delete({
      where: {
        id: languageId,
      },
    });

    return {
      status: 'success',
      message: 'Course language deleted successfully',
    };
  }

  async statusUpdate(id: string) {
    const languageId = BigInt(id);

    const language = await this.prisma.course_languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!language) {
      throw new NotFoundException('Course language not found');
    }

    const newStatus = !language.status;

    await this.prisma.course_languages.update({
      where: {
        id: languageId,
      },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
    };
  }
}