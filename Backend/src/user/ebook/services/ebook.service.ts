import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EbookQueryDto } from '../dto/ebook-query.dto';

@Injectable()
export class EbookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/v1/ebooks
   */
  async index(dto: EbookQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 9;
    const skip = (page - 1) * limit;

    const where: any = {
      status: true,
    };

    // category = parent category slug
    if (dto.category) {
      const parentCategory =
        await this.prisma.course_categories.findFirst({
          where: {
            slug: dto.category,
            parent_id: null,
            status: true,
          },
        });

      if (parentCategory) {
        const childCategories =
          await this.prisma.course_categories.findMany({
            where: {
              parent_id: parentCategory.id,
              status: true,
            },
            select: {
              id: true,
            },
          });

        where.category_id = {
          in: childCategories.map((category) => category.id),
        };
      } else {
        // Laravel whereHas would return no records
        where.category_id = {
          in: [],
        };
      }
    }

    // subcategory = direct category slug
    if (dto.subcategory) {
      const subCategory =
        await this.prisma.course_categories.findFirst({
          where: {
            slug: dto.subcategory,
            status: true,
          },
        });

      where.category_id = subCategory
        ? subCategory.id
        : BigInt(-1);
    }

    // language
    if (
      dto.language &&
      dto.language !== 'null'
    ) {
      where.language = dto.language;
    }

    // sub subject
    if (dto.sub_subject) {
      where.sub_subject = dto.sub_subject;
    }

    // title search
    if (dto.search?.trim()) {
      where.title = {
        contains: dto.search.trim(),
      };
    }

    const [ebooks, total] = await Promise.all([
      this.prisma.ebooks.findMany({
        where,
        include: {
          course_categories: true,
          courses: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.ebooks.count({
        where,
      }),
    ]);

    // Laravel:
    // CAST(REGEXP_SUBSTR(title, '[0-9]+') AS UNSIGNED) ASC
    //
    // Prisma doesn't provide this MySQL expression directly,
    // so we reproduce the numeric-title ordering here.
    ebooks.sort((a, b) => {
      const aNumber = this.extractNumber(a.title);
      const bNumber = this.extractNumber(b.title);

      if (aNumber !== bNumber) {
        return aNumber - bNumber;
      }

      return a.title.localeCompare(b.title);
    });

    return {
      status: 'success',
      data: {
        current_page: page,
        data: ebooks.map((ebook) =>
          this.serializeEbook(ebook),
        ),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /api/v1/ebooks/filters
   */
  async filters() {
    const classes =
      await this.prisma.course_categories.findMany({
        where: {
          parent_id: null,
          status: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

    const result: any[] = [];

    for (const classCategory of classes) {
      const translation =
        await this.prisma.course_category_translations.findFirst({
          where: {
            course_category_id: classCategory.id,
            lang_code: 'en',
          },
        });

      const subjects =
        await this.prisma.course_categories.findMany({
          where: {
            parent_id: classCategory.id,
            status: true,
            ebooks: {
              some: {
                status: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        });

      if (subjects.length === 0) {
        continue;
      }

      const subjectResult: any[] = [];

      for (const subject of subjects) {
        const subjectTranslation =
          await this.prisma.course_category_translations.findFirst({
            where: {
              course_category_id: subject.id,
              lang_code: 'en',
            },
          });

        const total =
          await this.prisma.ebooks.count({
            where: {
              category_id: subject.id,
              status: true,
            },
          });

        subjectResult.push({
          id: subject.id.toString(),
          slug: subject.slug,
          name: subjectTranslation?.name ?? '',
          total,
        });
      }

      result.push({
        id: classCategory.id.toString(),
        slug: classCategory.slug,
        name: translation?.name ?? '',
        subjects: subjectResult,
      });
    }

    return {
      status: 'success',
      data: result,
    };
  }

  /**
   * GET /api/v1/ebooks/:slug
   */
  async show(slug: string) {
    const ebook =
      await this.prisma.ebooks.findFirst({
        where: {
          slug,
          status: true,
        },
        include: {
          course_categories: true,
          courses: true,
        },
      });

    if (!ebook) {
      throw new NotFoundException('Ebook not found');
    }

    return {
      status: 'success',
      data: this.serializeEbook(ebook),
    };
  }

  private extractNumber(title: string): number {
    const match = title.match(/\d+/);

    return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
  }

  private serializeEbook(ebook: any) {
    return {
      ...ebook,
      id: ebook.id?.toString(),
      category_id:
        ebook.category_id?.toString() ?? null,
      course_id:
        ebook.course_id?.toString() ?? null,

      course_categories:
        ebook.course_categories
          ? {
              ...ebook.course_categories,
              id: ebook.course_categories.id?.toString(),
              parent_id:
                ebook.course_categories.parent_id?.toString() ??
                null,
            }
          : null,

      courses: ebook.courses
        ? {
            ...ebook.courses,
            id: ebook.courses.id?.toString(),
            instructor_id:
              ebook.courses.instructor_id?.toString(),
            category_id:
              ebook.courses.category_id?.toString() ??
              null,
          }
        : null,
    };
  }
}