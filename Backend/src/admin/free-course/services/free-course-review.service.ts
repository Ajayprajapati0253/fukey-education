import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateFreeCourseReviewDto } from '../dto/update-free-course-review.dto';

@Injectable()
export class FreeCourseReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    keyword?: string;
    status?: string;
    order_by?: string;
    page?: number;
    per_page?: number;
    par_page?: string;
  }) {
    const {
      keyword,
      status,
      order_by,
      page = 1,
      per_page = 10,
      par_page,
    } = query;

    const where: any = {};

    // Laravel:
    // whereHas('freeCourse')
    const courses = await this.prisma.free_courses.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    const courseIds = courses.map((course) => course.id);

    where.free_course_id = {
      in: courseIds,
    };

    // Laravel:
    // whereHas('user')
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
      },
    });

    const userIds = users.map((user) => user.id);

    where.user_id = {
      in: userIds,
    };

    // Keyword → Free course title
    if (keyword) {
      const matchingCourses =
        await this.prisma.free_courses.findMany({
          where: {
            title: {
              contains: keyword,
            },
          },
          select: {
            id: true,
          },
        });

      where.free_course_id = {
        in: matchingCourses.map((course) => course.id),
      };
    }

    // Status filter
    if (status !== undefined && status !== '') {
      if (status === '1' || status === 'true') {
        where.status = true;
      } else if (status === '0' || status === 'false') {
        where.status = false;
      }
    }

    const orderDirection =
      order_by === '1' ? 'asc' : 'desc';

    const reviews =
      par_page === 'all'
        ? await this.prisma.free_course_reviews.findMany({
            where,
            orderBy: {
              id: orderDirection,
            },
          })
        : await this.prisma.free_course_reviews.findMany({
            where,
            orderBy: {
              id: orderDirection,
            },
            skip: (page - 1) * per_page,
            take: per_page,
          });

    const reviewCourseIds = [
      ...new Set(
        reviews.map((review) => review.free_course_id),
      ),
    ];

    const reviewUserIds = [
      ...new Set(
        reviews.map((review) => review.user_id),
      ),
    ];

    const [reviewCourses, reviewUsers] =
      await Promise.all([
        this.prisma.free_courses.findMany({
          where: {
            id: {
              in: reviewCourseIds,
            },
          },
          select: {
            id: true,
            title: true,
          },
        }),

        this.prisma.users.findMany({
          where: {
            id: {
              in: reviewUserIds,
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

    const data = reviews.map((review) => ({
      ...review,
      id: Number(review.id),
      free_course_id: Number(review.free_course_id),
      user_id: Number(review.user_id),
      free_course:
        reviewCourses.find(
          (course) =>
            course.id === review.free_course_id,
        ) ?? null,
      user:
        reviewUsers.find(
          (user) => user.id === review.user_id,
        ) ?? null,
    }));

    if (par_page === 'all') {
      return {
        status: 'success',
        data,
      };
    }

    const total =
      await this.prisma.free_course_reviews.count({
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

  async findOne(id: number) {
    const review =
      await this.prisma.free_course_reviews.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Free course review not found',
      );
    }

    const [course, user] = await Promise.all([
      this.prisma.free_courses.findUnique({
        where: {
          id: review.free_course_id,
        },
        select: {
          id: true,
          title: true,
        },
      }),

      this.prisma.users.findUnique({
        where: {
          id: review.user_id,
        },
      }),
    ]);

    return {
      status: 'success',
      data: {
        ...review,
        id: Number(review.id),
        free_course_id: Number(review.free_course_id),
        user_id: Number(review.user_id),
        free_course: course
          ? {
              ...course,
              id: Number(course.id),
            }
          : null,
        user: user
          ? {
              ...user,
              id: Number(user.id),
            }
          : null,
      },
    };
  }

  async update(
    id: number,
    dto: UpdateFreeCourseReviewDto,
  ) {
    const review =
      await this.prisma.free_course_reviews.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Free course review not found',
      );
    }

    const updated =
      await this.prisma.free_course_reviews.update({
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
        ...updated,
        id: Number(updated.id),
        free_course_id: Number(
          updated.free_course_id,
        ),
        user_id: Number(updated.user_id),
      },
    };
  }

  async remove(id: number) {
    const review =
      await this.prisma.free_course_reviews.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!review) {
      throw new NotFoundException(
        'Free course review not found',
      );
    }

    await this.prisma.free_course_reviews.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }
}