import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DemoClassQueryDto } from '../dto/demo-class-query.dto';

@Injectable()
export class DemoClassService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemoClasses(dto: DemoClassQueryDto) {
    // 1. Find class category from translation
    const classCategory = await this.prisma.course_category_translations.findFirst({
      where: {
        name: `Class ${dto.class_level}`,
        lang_code: 'en',
      },
      select: {
        course_category_id: true,
      },
    });

    // Laravel:
    // if (!$classCategoryId) {
    //     return response()->json(['success' => true, 'data' => []]);
    // }

    if (!classCategory) {
      return {
        success: true,
        data: [],
      };
    }

    const classCategoryId = classCategory.course_category_id;

    // 2. Find subject if subject is provided
    let subjectId: bigint | null = null;

    if (dto.subject) {
      const subject = await this.prisma.course_categories.findFirst({
        where: {
          slug: dto.subject,
          parent_id: classCategoryId,
        },
        select: {
          id: true,
        },
      });

      subjectId = subject?.id ?? null;
    }

    // 3. Find categories for demo classes
    let categoryIds: bigint[];

    if (subjectId) {
      // Subject found → only that subject
      categoryIds = [subjectId];
    } else {
      // No subject OR subject not found
      // Laravel fallback → all subjects under class
      const subjects = await this.prisma.course_categories.findMany({
        where: {
          parent_id: classCategoryId,
        },
        select: {
          id: true,
        },
      });

      categoryIds = subjects.map((subject) => subject.id);
    }

    // 4. Find active demo classes
    const demoClasses = await this.prisma.demo_classes.findMany({
      where: {
        language: dto.language,
        is_active: true,
        course_category_id: {
          in: categoryIds,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    // 5. Fetch categories manually
    const categories =
      categoryIds.length > 0
        ? await this.prisma.course_categories.findMany({
            where: {
              id: {
                in: categoryIds,
              },
            },
          })
        : [];

    const categoryMap = new Map(
      categories.map((category) => [category.id.toString(), category]),
    );

    // 6. Attach category + serialize BigInt
    const data = demoClasses.map((demoClass) => {
      const category = categoryMap.get(
        demoClass.course_category_id.toString(),
      );

      return {
        ...demoClass,
        id: demoClass.id.toString(),
        course_category_id: demoClass.course_category_id.toString(),

        category: category
          ? {
              ...category,
              id: category.id.toString(),
              parent_id: category.parent_id?.toString() ?? null,
            }
          : null,
      };
    });

    return {
      success: true,
      data,
    };
  }

  async getDemoFilters() {
  // 1. Get active parent categories (Classes)
  const classes = await this.prisma.course_categories.findMany({
    where: {
      parent_id: null,
      status: true,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (classes.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const classIds = classes.map((item) => item.id);

  // 2. Get English translations for classes
  const classTranslations =
    await this.prisma.course_category_translations.findMany({
      where: {
        course_category_id: {
          in: classIds,
        },
        lang_code: 'en',
      },
      select: {
        course_category_id: true,
        name: true,
      },
    });

  // 3. Get active subjects under these classes
  const subjects = await this.prisma.course_categories.findMany({
    where: {
      parent_id: {
        in: classIds,
      },
      status: true,
    },
    select: {
      id: true,
      slug: true,
      parent_id: true,
    },
  });

  // 4. Get English translations for subjects
  const subjectIds = subjects.map((item) => item.id);

  const subjectTranslations =
    subjectIds.length > 0
      ? await this.prisma.course_category_translations.findMany({
          where: {
            course_category_id: {
              in: subjectIds,
            },
            lang_code: 'en',
          },
          select: {
            course_category_id: true,
            name: true,
          },
        })
      : [];

  // 5. Create translation maps
  const classTranslationMap = new Map(
    classTranslations.map((translation) => [
      translation.course_category_id.toString(),
      translation.name,
    ]),
  );

  const subjectTranslationMap = new Map(
    subjectTranslations.map((translation) => [
      translation.course_category_id.toString(),
      translation.name,
    ]),
  );

  // 6. Build final response
  const data = classes.map((classCategory) => {
    const classId = classCategory.id.toString();

    const classSubjects = subjects
      .filter(
        (subject) =>
          subject.parent_id?.toString() === classId,
      )
      .map((subject) => ({
        slug: subject.slug,
        name:
          subjectTranslationMap.get(subject.id.toString()) ?? null,
      }));

    return {
      slug: classCategory.slug,
      name: classTranslationMap.get(classId) ?? null,
      subjects: classSubjects,
    };
  });

  return {
    success: true,
    data,
  };
}
}