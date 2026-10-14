import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

async wishlistCourses(
  userId: string,
  page: number = 1,
  limit: number = 6,
) {
  const userIdBigInt = BigInt(userId);

  const skip = (page - 1) * limit;

  /*
   * Check user
   */
  const user = await this.prisma.users.findUnique({
    where: {
      id: userIdBigInt,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  /*
   * Get wishlist entries
   */
  const favorites =
    await this.prisma.favorite_course_user.findMany({
      where: {
        user_id: user.id,
      },

      orderBy: {
        id: 'desc',
      },

      skip,
      take: limit,

      select: {
        id: true,
        user_id: true,
        course_id: true,

        courses: {
          select: {
            id: true,
            instructor_id: true,
            category_id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    });

  /*
   * No wishlist courses
   */
  if (favorites.length === 0) {
    return {
      status: 'error',
      message: 'Not Found!',
    };
  }

  /*
   * Category IDs
   */
  const categoryIds = [
    ...new Set(
      favorites
        .map(
          (favorite) =>
            favorite.courses.category_id,
        )
        .filter(
          (
            categoryId,
          ): categoryId is bigint =>
            categoryId !== null,
        ),
    ),
  ];

  /*
   * Get categories
   */
  const categories =
    categoryIds.length > 0
      ? await this.prisma.course_categories.findMany({
          where: {
            id: {
              in: categoryIds,
            },
            status: true,
          },
          select: {
            id: true,
            parent_id: true,
          },
        })
      : [];

  /*
   * Parent category IDs
   */
  const parentCategoryIds = [
    ...new Set(
      categories
        .map(
          (category) =>
            category.parent_id,
        )
        .filter(
          (
            parentId,
          ): parentId is bigint =>
            parentId !== null,
        ),
    ),
  ];

  /*
   * Get active parent categories
   */
  const parentCategories =
    parentCategoryIds.length > 0
      ? await this.prisma.course_categories.findMany({
          where: {
            id: {
              in: parentCategoryIds,
            },
            status: true,
          },
          select: {
            id: true,
          },
        })
      : [];

  /*
   * Active parent category ID set
   */
  const activeParentCategoryIds =
    new Set(
      parentCategories.map(
        (category) =>
          category.id.toString(),
      ),
    );

  /*
   * Valid category IDs
   *
   * Laravel:
   * category.status = 1
   * AND
   * category.parentCategory.status = 1
   */
  const validCategoryIds = new Set(
    categories
      .filter(
        (category) =>
          category.parent_id !== null &&
          activeParentCategoryIds.has(
            category.parent_id.toString(),
          ),
      )
      .map(
        (category) =>
          category.id.toString(),
      ),
  );

  /*
   * Keep only courses having
   * valid active category + parent category
   */
  const validFavorites =
    favorites.filter((favorite) => {
      const categoryId =
        favorite.courses.category_id;

      if (categoryId === null) {
        return false;
      }

      return validCategoryIds.has(
        categoryId.toString(),
      );
    });

  /*
   * No valid wishlist courses
   */
  if (validFavorites.length === 0) {
    return {
      status: 'error',
      message: 'Not Found!',
    };
  }

  /*
   * Valid course IDs
   */
  const courseIds =
    validFavorites.map(
      (favorite) =>
        favorite.course_id,
    );

  /*
   * Get enrollment counts
   */
  const enrollmentCounts =
    await this.prisma.enrollments.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
      },

      select: {
        course_id: true,
      },
    });

  /*
   * Build enrollment count map
   */
  const enrollmentCountMap = new Map<
    string,
    number
  >();

  for (const enrollment of enrollmentCounts) {
    const courseId =
      enrollment.course_id.toString();

    enrollmentCountMap.set(
      courseId,
      (enrollmentCountMap.get(courseId) ?? 0) + 1,
    );
  }

  /*
   * Get active reviews
   *
   * Laravel:
   * reviews where status = 1
   */
  const ratings =
    await this.prisma.course_reviews.groupBy({
      by: ['course_id'],

      where: {
        course_id: {
          in: courseIds,
        },

        status: true,
      },

      _avg: {
        rating: true,
      },
    });

  /*
   * Build rating map
   */
  const ratingMap = new Map<
    string,
    number
  >();

  for (const rating of ratings) {
    const averageRating =
      rating._avg?.rating;

    if (averageRating !== undefined) {
      ratingMap.set(
        rating.course_id.toString(),
        Number(averageRating),
      );
    }
  }

  /*
   * Build response
   */
  const data =
    validFavorites.map(
      (favorite) => {
        const course =
          favorite.courses;

        const courseId =
          course.id.toString();

        return {
          id: courseId,

          instructor_id:
            course.instructor_id.toString(),

          title: course.title,

          slug: course.slug,

          thumbnail:
            course.thumbnail,

          average_rating:
            ratingMap.get(courseId) ?? 0,

          enrollments:
            enrollmentCountMap.get(courseId) ?? 0,
        };
      },
    );

  /*
   * Pagination
   */
  const total =
    await this.prisma.favorite_course_user.count({
      where: {
        user_id: user.id,
      },
    });

  const lastPage =
    Math.ceil(total / limit);

  return {
    status: 'success',

    data,

    pagination: {
      current_page: page,
      per_page: limit,
      total,
      last_page: lastPage,

      links: {
        first:
          `/dashboard/wishlist-courses?page=1&limit=${limit}`,

        prev:
          page > 1
            ? `/dashboard/wishlist-courses?page=${page - 1}&limit=${limit}`
            : null,

        next:
          page < lastPage
            ? `/dashboard/wishlist-courses?page=${page + 1}&limit=${limit}`
            : null,

        last:
          `/dashboard/wishlist-courses?page=${lastPage}&limit=${limit}`,
      },
    },
  };
}

async addRemoveWishlist(userId: string | number, courseId: string | number) {
  const userIdBigInt = BigInt(userId);
  const courseIdBigInt = BigInt(courseId);

  // Check whether course exists
  const course = await this.prisma.courses.findUnique({
    where: {
      id: courseIdBigInt,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  // Find all matching wishlist entries, including duplicates
  const favorites = await this.prisma.favorite_course_user.findMany({
    where: {
      user_id: userIdBigInt,
      course_id: courseIdBigInt,
    },
    select: {
      id: true,
    },
  });

  if (favorites.length > 0) {
    // Remove every duplicate entry for this user and course
    await this.prisma.favorite_course_user.deleteMany({
      where: {
        user_id: userIdBigInt,
        course_id: courseIdBigInt,
      },
    });
  } else {
    // Add course to wishlist
    await this.prisma.favorite_course_user.create({
      data: {
        user_id: userIdBigInt,
        course_id: courseIdBigInt,
      },
    });
  }

  return {
    status: 'success',
    message: 'Success',
  };
}
}