import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCourseReviewDto } from '../dto/update-course-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    keyword?: string,
    status?: string,
    page = 1,
    limit = 15,
    orderBy?: string,
  ) {
    const where: any = {};

    if (status !== undefined && status !== '') {
      where.status = status === '1' || status === 'true';
    }

    // Laravel:
    // whereHas('course')
    // whereHas('user')
    //
    // Prisma schema currently doesn't have relations,
    // so we filter valid course/user records manually.

    const reviews = await this.prisma.course_reviews.findMany({
      where,
      orderBy: {
        id: orderBy === '1' ? 'asc' : 'desc',
      },
    });

const validReviews: any[] = [];

    for (const review of reviews) {
      const course = await this.prisma.courses.findUnique({
        where: {
          id: review.course_id,
        },
        select: {
          id: true,
          title: true,
        },
      });

      const user = await this.prisma.users.findUnique({
        where: {
          id: review.user_id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!course || !user) {
        continue;
      }

      if (
        keyword &&
        !course.title
          .toLowerCase()
          .includes(keyword.toLowerCase())
      ) {
        continue;
      }

      validReviews.push({
        ...review,
        id: review.id.toString(),
        course_id: review.course_id.toString(),
        user_id: review.user_id.toString(),
        course: {
          id: course.id.toString(),
          title: course.title,
        },
        user: {
          id: user.id.toString(),
          name: user.name,
        },
      });
    }

    const total = validReviews.length;

    const startIndex = (page - 1) * limit;

    const paginatedReviews = validReviews.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      status: 'success',
      data: paginatedReviews,
      meta: {
        current_page: page,
        last_page:
          total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async findOne(id: string) {
    const reviewId = BigInt(id);

    const review = await this.prisma.course_reviews.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Course review not found');
    }

    const course = await this.prisma.courses.findUnique({
      where: {
        id: review.course_id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const user = await this.prisma.users.findUnique({
      where: {
        id: review.user_id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      status: 'success',
      data: {
        ...review,
        id: review.id.toString(),
        course_id: review.course_id.toString(),
        user_id: review.user_id.toString(),
        course: course
          ? {
              id: course.id.toString(),
              title: course.title,
            }
          : null,
        user: user
          ? {
              id: user.id.toString(),
              name: user.name,
            }
          : null,
      },
    };
  }

  async update(
    id: string,
    dto: UpdateCourseReviewDto,
  ) {
    const reviewId = BigInt(id);

    const review = await this.prisma.course_reviews.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Course review not found');
    }

    const updatedReview =
      await this.prisma.course_reviews.update({
        where: {
          id: reviewId,
        },
        data: {
          status: dto.status,
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Updated successfully',
      data: {
        ...updatedReview,
        id: updatedReview.id.toString(),
        course_id: updatedReview.course_id.toString(),
        user_id: updatedReview.user_id.toString(),
      },
    };
  }

  async remove(id: string) {
    const reviewId = BigInt(id);

    const review = await this.prisma.course_reviews.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Course review not found');
    }

    await this.prisma.course_reviews.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }
}