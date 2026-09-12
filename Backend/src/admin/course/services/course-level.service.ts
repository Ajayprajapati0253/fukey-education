import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseLevelDto } from '../dto/create-course-level.dto';
import { UpdateCourseLevelDto } from '../dto/update-course-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseLevelService {
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
      // Translation table ka exact relation Prisma schema me confirm karna hai.
      // Isliye abhi keyword filtering translation par nahi laga rahe.
    }

    if (status !== undefined && status !== '') {
      where.status = status === '1' || status === 'true';
    }

    const order = orderBy === '1' ? 'asc' : 'desc';

    const [total, courseLevels] = await this.prisma.$transaction([
      this.prisma.course_levels.count({ where }),
      this.prisma.course_levels.findMany({
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
      data: courseLevels.map((level) => ({
        ...level,
        id: level.id.toString(),
      })),
      meta: {
        current_page: page,
        last_page: total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async create(dto: CreateCourseLevelDto) {
    const courseLevel = await this.prisma.course_levels.create({
      data: {
        slug: dto.slug,
        status: dto.status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course level created successfully',
      data: {
        ...courseLevel,
        id: courseLevel.id.toString(),
      },
    };
  }

  async findOne(id: string) {
    const courseLevel = await this.prisma.course_levels.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!courseLevel) {
      throw new NotFoundException('Course level not found');
    }

    return {
      status: 'success',
      data: {
        ...courseLevel,
        id: courseLevel.id.toString(),
      },
    };
  }

  async update(id: string, dto: UpdateCourseLevelDto) {
    const levelId = BigInt(id);

    const courseLevel = await this.prisma.course_levels.findUnique({
      where: {
        id: levelId,
      },
    });

    if (!courseLevel) {
      throw new NotFoundException('Course level not found');
    }

    const updatedLevel = await this.prisma.course_levels.update({
      where: {
        id: levelId,
      },
      data: {
        status: dto.status,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course level updated successfully',
      data: {
        ...updatedLevel,
        id: updatedLevel.id.toString(),
      },
    };
  }

  async remove(id: string) {
    const levelId = BigInt(id);

    const courseLevel = await this.prisma.course_levels.findUnique({
      where: {
        id: levelId,
      },
    });

    if (!courseLevel) {
      throw new NotFoundException('Course level not found');
    }

    const isUsed =
      await this.prisma.course_selected_levels.findFirst({
        where: {
          level_id: levelId,
        },
      });

    if (isUsed) {
      throw new ConflictException(
        'Can not delete this level because it being used by courses',
      );
    }

    await this.prisma.course_levels.delete({
      where: {
        id: levelId,
      },
    });

    return {
      status: 'success',
      message: 'Course level deleted successfully',
    };
  }

  async statusUpdate(id: string) {
    const levelId = BigInt(id);

    const courseLevel = await this.prisma.course_levels.findUnique({
      where: {
        id: levelId,
      },
    });

    if (!courseLevel) {
      throw new NotFoundException('Course level not found');
    }

    const updatedLevel = await this.prisma.course_levels.update({
      where: {
        id: levelId,
      },
      data: {
        status: !courseLevel.status,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updatedLevel,
        id: updatedLevel.id.toString(),
      },
    };
  }
}