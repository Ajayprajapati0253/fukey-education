import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class YtCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active YouTube courses with pagination
   */
  async findAll(page = 1, limit = 10) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 10));

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.yt_courses.findMany({
        where: {
          is_active: true,
        },
        orderBy: [
          {
            sort_order: 'asc',
          },
          {
            published_at: 'desc',
          },
        ],
        skip,
        take: limit,
      }),

      this.prisma.yt_courses.count({
        where: {
          is_active: true,
        },
      }),
    ]);

    return {
      status: true,
      message: 'YT courses fetched successfully',
      data: {
        courses: courses.map((course) => ({
          ...course,
          id: course.id.toString(),
        })),
        pagination: {
          current_page: page,
          per_page: limit,
          total,
          last_page: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get single YouTube course
   */
  async findOne(id: string) {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new NotFoundException('YT course not found');
    }

    const course = await this.prisma.yt_courses.findFirst({
      where: {
        id: BigInt(id),
        is_active: true,
      },
    });

    if (!course) {
      throw new NotFoundException('YT course not found');
    }

    return {
      status: true,
      message: 'YT course fetched successfully',
      data: {
        ...course,
        id: course.id.toString(),
      },
    };
  }
}