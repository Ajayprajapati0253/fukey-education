import { Injectable } from '@nestjs/common';
import { FeaturedCourseSectionDto } from '../dto/featured-course-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeaturedCourseSectionService {
  constructor(private readonly prisma: PrismaService) {}

async index() {
  const categories =
    await this.prisma.course_categories.findMany({
      where: {
        parent_id: null,
        status: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

  const parentCategoryIds = categories.map(
    (category) => category.id,
  );

  const childCategories =
    await this.prisma.course_categories.findMany({
      where: {
        parent_id: {
          in: parentCategoryIds,
        },
      },
      select: {
        id: true,
      },
    });

  const childCategoryIds = childCategories.map(
    (category) => category.id,
  );

  const allCourses = await this.prisma.courses.findMany({
    where: {
      status: 'active',
      category_id: {
        in: childCategoryIds,
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  const featured =
    await this.prisma.featured_course_sections.findFirst({
      orderBy: {
        id: 'asc',
      },
    });

  return {
    allCourses,
    categories,
    featured,
  };
}

async coursesByCategory(id: number) {
  const parentCategoryId = BigInt(id);

  const childCategories =
    await this.prisma.course_categories.findMany({
      where: {
        parent_id: parentCategoryId,
      },
      select: {
        id: true,
      },
    });

  const categoryIds = childCategories.map(
    (category) => category.id,
  );

  return this.prisma.courses.findMany({
    where: {
      status: 'active',
      category_id: {
        in: categoryIds,
      },
    },
    select: {
      id: true,
      title: true,
    },
  });
}

  async update(id: number, dto: FeaturedCourseSectionDto) {
    const data: any = {
      ...dto,
    };

    const idFields = [
      'all_category_ids',
      'category_one_ids',
      'category_two_ids',
      'category_three_ids',
      'category_four_ids',
      'category_five_ids',
    ];

    for (const field of idFields) {
      if (field in data) {
        const value = data[field];

        if (Array.isArray(value)) {
          data[field] = JSON.stringify(value);
        }
      }
    }

    const featured =
      await this.prisma.featured_course_sections.upsert({
        where: {
          id: BigInt(id),
        },
        update: data,
        create: {
          ...data,
          id: BigInt(id),
        },
      });

    return featured;
  }
}