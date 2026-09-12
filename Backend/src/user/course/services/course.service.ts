import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AllCoursesDto } from '../dto/all-courses.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async allCourses(dto: AllCoursesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const skip = (page - 1) * limit;

    const where: any = {
      is_approved: 'approved',
      status: 'active',
    };

    // SEARCH
    if (dto.search) {
      where.title = {
        contains: dto.search,
      };
    }

    // MAIN CATEGORY
    if (dto.main_category) {
      const parentCategories =
        await this.prisma.course_categories.findMany({
          where: {
            slug: dto.main_category,
          },
          select: {
            id: true,
          },
        });

      const parentIds = parentCategories.map(
        (category) => category.id,
      );

      if (parentIds.length === 0) {
        return {
          status: 'success',
          data: [],
          meta: {
            current_page: page,
            last_page: 0,
            total: 0,
          },
        };
      }

      const childCategories =
        await this.prisma.course_categories.findMany({
          where: {
            parent_id: {
              in: parentIds,
            },
          },
          select: {
            id: true,
          },
        });

      const categoryIds = childCategories.map(
        (category) => category.id,
      );

      if (categoryIds.length === 0) {
        return {
          status: 'success',
          data: [],
          meta: {
            current_page: page,
            last_page: 0,
            total: 0,
          },
        };
      }

      where.category_id = {
        in: categoryIds,
      };
    }

    // CATEGORY
    if (dto.category) {
      const categoryIds = dto.category
        .split(',')
        .filter(Boolean)
        .map((id) => BigInt(id));

      where.category_id = {
        in: categoryIds,
      };
    }

    // LANGUAGE
    if (dto.language) {
      const languageIds = dto.language
        .split(',')
        .filter(Boolean)
        .map((id) => BigInt(id));

      const selectedLanguages =
        await this.prisma.course_selected_languages.findMany({
          where: {
            language_id: {
              in: languageIds,
            },
          },
          select: {
            course_id: true,
          },
        });

      const courseIds = selectedLanguages.map(
        (item) => item.course_id,
      );

      if (courseIds.length === 0) {
        return {
          status: 'success',
          data: [],
          meta: {
            current_page: page,
            last_page: 0,
            total: 0,
          },
        };
      }

      where.id = {
        in: courseIds,
      };
    }

    // PRICE
    if (dto.price === 'paid') {
      where.price = {
        gt: 0,
      };
    }

    if (dto.price === 'free') {
      where.OR = [
        {
          price: 0,
        },
        {
          price: null,
        },
      ];
    }

    // LEVEL
    if (dto.level) {
      const levelIds = dto.level
        .split(',')
        .filter(Boolean)
        .map((id) => BigInt(id));

      const selectedLevels =
        await this.prisma.course_selected_levels.findMany({
          where: {
            level_id: {
              in: levelIds,
            },
          },
          select: {
            course_id: true,
          },
        });

      const courseIds = selectedLevels.map(
        (item) => item.course_id,
      );

      if (courseIds.length === 0) {
        return {
          status: 'success',
          data: [],
          meta: {
            current_page: page,
            last_page: 0,
            total: 0,
          },
        };
      }

      where.id = {
        in: courseIds,
      };
    }

    // SORT
    const order =
      dto.order === 'asc'
        ? 'asc'
        : 'desc';

    const [total, courses] =
      await this.prisma.$transaction([
        this.prisma.courses.count({
          where,
        }),

        this.prisma.courses.findMany({
          where,
          skip,
          take: limit,

          orderBy: {
            created_at: order,
          },

          include: {
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },

            enrollments: {
              select: {
                id: true,
              },
            },
          },
        }),
      ]);

    const data = await Promise.all(
      courses.map(async (course) => {
        let category: any = null;

        // CATEGORY
        if (course.category_id) {
          const categoryRecord =
            await this.prisma.course_categories.findUnique({
              where: {
                id: course.category_id,
              },
            });

          if (categoryRecord) {
            const translations =
              await this.prisma.course_category_translations.findMany(
                {
                  where: {
                    course_category_id:
                      categoryRecord.id,
                  },
                },
              );

            category = {
              ...categoryRecord,

              id: categoryRecord.id.toString(),

              translations: translations.map(
                (translation) => ({
                  ...translation,
                  id: translation.id.toString(),
                  course_category_id:
                    translation.course_category_id.toString(),
                }),
              ),
            };
          }
        }

        return {
          ...course,

          id: course.id.toString(),

          instructor: course.instructor
            ? {
                ...course.instructor,
                id: course.instructor.id.toString(),
              }
            : null,

          category,

          enrollments_count:
            course.enrollments.length,

          enrollments: undefined,
        };
      }),
    );

    return {
      status: 'success',
      data,

      meta: {
        current_page: page,

        last_page:
          total > 0
            ? Math.ceil(total / limit)
            : 0,

        total,
      },
    };
  }
}