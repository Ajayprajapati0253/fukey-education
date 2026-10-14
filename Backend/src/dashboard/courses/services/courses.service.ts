import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async enrolledCourses(
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
     * Total enrolled courses
     */
    const total = await this.prisma.enrollments.count({
      where: {
        user_id: user.id,
      },
    });

    /*
     * Get enrollments
     */
    
    const enrollments =
      await this.prisma.enrollments.findMany({
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
          order_id: true,
          user_id: true,
          course_id: true,
          has_access: true,
        },
      });

    /*
     * No enrollments
     */
    if (enrollments.length === 0) {
      return {
        status: 'error',
        message: 'Not Found!',
      };
    }

    /*
     * Course IDs
     */
    const courseIds = enrollments.map(
      (enrollment) => enrollment.course_id,
    );

    /*
     * Get courses
     */
    const courses =
      await this.prisma.courses.findMany({
        where: {
          id: {
            in: courseIds,
          },
        },
        select: {
          id: true,
          instructor_id: true,
          title: true,
          slug: true,
          thumbnail: true,
        },
      });

    /*
     * Instructor IDs
     */
    const instructorIds = [
      ...new Set(
        courses.map((course) =>
          course.instructor_id.toString(),
        ),
      ),
    ].map((id) => BigInt(id));

    /*
     * Get instructors
     */
    const instructors =
      instructorIds.length > 0
        ? await this.prisma.users.findMany({
            where: {
              id: {
                in: instructorIds,
              },
            },
            select: {
              id: true,
              name: true,
              image: true,
            },
          })
        : [];

    /*
     * Enrollment counts
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
     * Course chapters
     */
    const chapters =
      await this.prisma.course_chapters.findMany({
        where: {
          course_id: {
            in: courseIds,
          },
        },
        select: {
          id: true,
          course_id: true,
        },
      });

    const chapterIds = chapters.map(
      (chapter) => chapter.id,
    );

    /*
     * Course chapter items
     */
    const chapterItems =
      chapterIds.length > 0
        ? await this.prisma.course_chapter_items.findMany({
            where: {
              chapter_id: {
                in: chapterIds,
              },
            },
            select: {
              id: true,
              chapter_id: true,
            },
          })
        : [];

    /*
     * Course progress
     *
     * IMPORTANT:
     * Prisma model name yahan tumhare schema ke
     * actual model name ke according hona chahiye.
     */
const progress =
  courseIds.length > 0
    ? await this.prisma.course_progress.findMany({
        where: {
          user_id: user.id,
          course_id: {
            in: courseIds,
          },
          watched: true,
        },
        select: {
          course_id: true,
        },
      })
    : [];

    /*
     * Build response
     */
    const data = enrollments.map(
      (enrollment) => {
        const course = courses.find(
          (item) =>
            item.id === enrollment.course_id,
        );

        if (!course) {
          return null;
        }

        const instructor = instructors.find(
          (item) =>
            item.id === course.instructor_id,
        );

        /*
         * Chapters belonging to course
         */
        const courseChapterIds =
          chapters
            .filter(
              (chapter) =>
                chapter.course_id ===
                course.id,
            )
            .map(
              (chapter) => chapter.id,
            );

        /*
         * Items belonging to course
         */
        const courseItemIds =
          chapterItems
            .filter((item) =>
              courseChapterIds.includes(
                item.chapter_id,
              ),
            )
            .map((item) => item.id);

        const totalItems =
          courseItemIds.length;

        /*
         * Watched items
         */
 const watchedItems =
  progress.filter(
    (item) =>
      item.course_id === course.id,
  ).length;

        /*
         * Completion percentage
         */
        const completedPercent =
          totalItems > 0
            ? Number(
                (
                  (watchedItems /
                    totalItems) *
                  100
                ).toFixed(2),
              )
            : 0;

        /*
         * Enrollment count
         */
        const enrollmentsCount =
          enrollmentCounts.filter(
            (item) =>
              item.course_id ===
              course.id,
          ).length;

        return {
          id: course.id.toString(),
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,

          instructor: instructor
            ? {
                id: instructor.id.toString(),
                name: instructor.name,
                image: instructor.image,
              }
            : null,

          has_access:
            enrollment.has_access,

          enrollments:
            enrollmentsCount,

          completed_percent:
            completedPercent,
        };
      },
    );

    /*
     * Remove null courses
     */
    const filteredData = data.filter(
      (item) => item !== null,
    );

    const lastPage =
      Math.ceil(total / limit);

    return {
      status: 'success',

      data: filteredData,

      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: lastPage,

        links: {
          first:
            `/dashboard/enrolled-courses?page=1&limit=${limit}`,

          prev:
            page > 1
              ? `/dashboard/enrolled-courses?page=${page - 1}&limit=${limit}`
              : null,

          next:
            page < lastPage
              ? `/dashboard/enrolled-courses?page=${page + 1}&limit=${limit}`
              : null,

          last:
            `/dashboard/enrolled-courses?page=${lastPage}&limit=${limit}`,
        },
      },
    };
  }

  
  async courseLearning(userId: string | number, slug: string) {
    const userIdBigInt = BigInt(userId);
  
    // 1. Verify enrollment with access
    const enrollment = await this.prisma.enrollments.findFirst({
      where: {
        user_id: userIdBigInt,
        has_access: true,
        courses: {
          slug,
        },
      },
      select: {
        id: true,
      },
    });
  
    if (!enrollment) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }
  
    // 2. Fetch active course
    const course = await this.prisma.courses.findFirst({
      where: {
        slug,
        status: 'active',
        category_id: {
          not: null,
        },
      },
      select: {
        id: true,
        instructor_id: true,
        thumbnail: true,
        title: true,
        description: true,
      },
    });
  
    if (!course) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }
  
    // 3. Instructor
    const instructor = await this.prisma.users.findUnique({
      where: {
        id: course.instructor_id,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
  
    // 4. Active chapters
    const chapters = await this.prisma.course_chapters.findMany({
      where: {
        course_id: course.id,
        status: 'active',
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        course_id: true,
        title: true,
        order: true,
      },
    });
  
    const chapterIds = chapters.map((chapter) => chapter.id);
  
    // 5. Chapter items
    const chapterItems =
      chapterIds.length > 0
        ? await this.prisma.course_chapter_items.findMany({
            where: {
              chapter_id: {
                in: chapterIds,
              },
            },
            orderBy: {
              order: 'asc',
            },
            select: {
              id: true,
              chapter_id: true,
              type: true,
              order: true,
            },
          })
        : [];
  
    const itemIds = chapterItems.map((item) => item.id);
  
    // 6. Active lessons
    const lessons =
      itemIds.length > 0
        ? await this.prisma.course_chapter_lessons.findMany({
            where: {
              course_id: course.id,
              chapter_item_id: {
                in: itemIds,
              },
              status: 'active',
            },
            select: {
              id: true,
              chapter_item_id: true,
              title: true,
              file_path: true,
              storage: true,
              file_type: true,
              duration: true,
              is_free: true,
            },
          })
        : [];
  
    // 7. Active quizzes
    const quizzes =
      itemIds.length > 0
        ? await this.prisma.quizzes.findMany({
            where: {
              course_id: course.id,
              chapter_item_id: {
                in: itemIds,
              },
              status: 'active',
            },
            select: {
              id: true,
              chapter_item_id: true,
              title: true,
              time: true,
              attempt: true,
              pass_mark: true,
              total_mark: true,
            },
          })
        : [];
  
    // 8. Build chapter structure
    const chapterData = chapters.map((chapter) => ({
      id: chapter.id.toString(),
      title: chapter.title,
      order: chapter.order,
      chapter_items: chapterItems
        .filter((item) => item.chapter_id === chapter.id)
        .map((item) => ({
          id: item.id.toString(),
          type: item.type,
          lesson:
            lessons
              .filter((lesson) => lesson.chapter_item_id === item.id)
              .map((lesson) => ({
                ...lesson,
                id: lesson.id.toString(),
                chapter_item_id: lesson.chapter_item_id.toString(),
              }))[0] ?? null,
          quiz:
            quizzes
              .filter((quiz) => quiz.chapter_item_id === item.id)
              .map((quiz) => ({
                ...quiz,
                id: quiz.id.toString(),
                chapter_item_id: quiz.chapter_item_id.toString(),
              }))[0] ?? null,
        })),
    }));
  
    // 9. Wishlist status
    const wishlist = await this.prisma.favorite_course_user.findFirst({
      where: {
        user_id: userIdBigInt,
        course_id: course.id,
      },
      select: {
        id: true,
      },
    });
  
    return {
      status: 'success',
      data: {
        ...course,
        id: course.id.toString(),
        instructor_id: course.instructor_id.toString(),
        instructor: instructor
          ? {
              ...instructor,
              id: instructor.id.toString(),
            }
          : null,
        chapters: chapterData,
        is_wishlist: wishlist ? 1 : 0,
      },
    };
  }

  async learningProgress(
    userId: string | number,
    slug: string,
  ) {
    const enrollment = await this.prisma.enrollments.findFirst({
      where: {
        user_id: BigInt(userId),
        has_access: true,
        courses: {
          slug: slug,
        },
      },
      select: {
        course_id: true,
      },
    });
  
    if (!enrollment) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }
  
    const courseId = enrollment.course_id;
  
    const totalItems = await this.prisma.course_chapter_items.count({
      where: {
        course_chapters: {
          course_id: courseId,
        },
      },
    });
  
    const completedItems = await this.prisma.course_progress.count({
      where: {
        user_id: BigInt(userId),
        course_id: courseId,
        watched: true,
      },
    });
  
    const progress =
      totalItems > 0
        ? (completedItems / totalItems) * 100
        : 0;
  
    return {
      status: 'success',
      data: progress,
    };
  }
}