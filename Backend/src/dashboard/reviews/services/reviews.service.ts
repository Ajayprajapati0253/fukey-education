
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReviews(
    userId: string | number,
    limit?: string,
    page?: string,
  ) {
    const parsedLimit =
      limit && Number.isInteger(Number(limit)) && Number(limit) > 0
        ? Math.min(Number(limit), 100)
        : 6;

    const parsedPage =
      page && Number.isInteger(Number(page)) && Number(page) > 0
        ? Number(page)
        : 1;

    const where = {
      user_id: BigInt(userId),
    };

    const total = await this.prisma.course_reviews.count({
      where,
    });

    if (total === 0) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    const reviews = await this.prisma.course_reviews.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
    });

    const lastPage = Math.ceil(total / parsedLimit);

    const makeUrl = (p: number) =>
      `/reviews?limit=${parsedLimit}&page=${p}`;

    return {
      status: 'success',
      data: reviews.map((review) => ({
        ...review,
        id: review.id.toString(),
        user_id: review.user_id.toString(),
        course_id: review.course_id.toString(),
        course: review.course
          ? {
              id: review.course.id.toString(),
              title: review.course.title,
            }
          : null,
      })),
      pagination: {
        current_page: parsedPage,
        per_page: parsedLimit,
        total,
        last_page: lastPage,
        links: {
          first: makeUrl(1),
          prev: parsedPage > 1 ? makeUrl(parsedPage - 1) : null,
          next: parsedPage < lastPage
            ? makeUrl(parsedPage + 1)
            : null,
          last: makeUrl(lastPage),
        },
      },
    };
  }

  async getReviewDetails(
    userId: string | number,
    reviewId: string | number,
  ) {
    const review = await this.prisma.course_reviews.findFirst({
      where: {
        id: BigInt(reviewId),
        user_id: BigInt(userId),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    return {
      status: 'success',
      data: {
        ...review,
        id: review.id.toString(),
        user_id: review.user_id.toString(),
        course_id: review.course_id.toString(),
        course: review.course
          ? {
              id: review.course.id.toString(),
              title: review.course.title,
            }
          : null,
      },
    };
  }

  async deleteReview(
    userId: string | number,
    reviewId: string | number,
  ) {
    const review = await this.prisma.course_reviews.findFirst({
      where: {
        id: BigInt(reviewId),
        user_id: BigInt(userId),
      },
      select: {
        id: true,
      },
    });

    if (!review) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    await this.prisma.course_reviews.delete({
      where: {
        id: review.id,
      },
    });

    return {
      status: 'success',
      message: 'Review deleted successfully',
    };
  }
}
