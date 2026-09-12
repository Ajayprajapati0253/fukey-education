import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCourseSubCategoryDto } from '../dto/create-course-sub-category.dto';
import { UpdateCourseSubCategoryDto } from '../dto/update-course-sub-category.dto';

@Injectable()
export class CourseSubCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    parentId: string,
    keyword?: string,
    status?: string,
    page = 1,
    limit = 15,
    orderBy?: string,
  ) {
    const where: any = {
      parent_id: BigInt(parentId),
    };

    if (status !== undefined && status !== '') {
      where.status = status === '1' || status === 'true';
    }

    const order = orderBy === '1' ? 'asc' : 'desc';

    const [total, categories] = await this.prisma.$transaction([
      this.prisma.course_categories.count({
        where,
      }),

      this.prisma.course_categories.findMany({
        where,
        orderBy: {
          id: order,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Translation search will be added once the exact
    // translation payload/schema is confirmed.
    let data = categories;

    if (keyword) {
      const translations =
        await this.prisma.course_category_translations.findMany({
          where: {
            name: {
              contains: keyword,
            },
          },
          select: {
            course_category_id: true,
          },
        });

      const translationCategoryIds = new Set(
        translations.map((item) =>
          item.course_category_id.toString(),
        ),
      );

      data = categories.filter((category) =>
        translationCategoryIds.has(category.id.toString()),
      );
    }

    return {
      status: 'success',
      data: data.map((category) => ({
        ...category,
        id: category.id.toString(),
        parent_id: category.parent_id?.toString() ?? null,
      })),
      meta: {
        current_page: page,
        last_page:
          total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async create(
    parentId: string,
    dto: CreateCourseSubCategoryDto,
  ) {
    const parentCategory =
      await this.prisma.course_categories.findUnique({
        where: {
          id: BigInt(parentId),
        },
      });

    if (!parentCategory) {
      throw new NotFoundException('Parent category not found');
    }

    const subCategory =
      await this.prisma.course_categories.create({
        data: {
          slug: dto.slug,
          parent_id: BigInt(parentId),
          status: dto.status,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Course sub-category created successfully',
      data: {
        ...subCategory,
        id: subCategory.id.toString(),
        parent_id:
          subCategory.parent_id?.toString() ?? null,
      },
    };
  }

  async findOne(
    parentId: string,
    subCategoryId: string,
  ) {
    const subCategory =
      await this.prisma.course_categories.findFirst({
        where: {
          id: BigInt(subCategoryId),
          parent_id: BigInt(parentId),
        },
      });

    if (!subCategory) {
      throw new NotFoundException(
        'Course sub-category not found',
      );
    }

    return {
      status: 'success',
      data: {
        ...subCategory,
        id: subCategory.id.toString(),
        parent_id:
          subCategory.parent_id?.toString() ?? null,
      },
    };
  }

  async update(
    parentId: string,
    subCategoryId: string,
    dto: UpdateCourseSubCategoryDto,
  ) {
    const subCategory =
      await this.prisma.course_categories.findFirst({
        where: {
          id: BigInt(subCategoryId),
          parent_id: BigInt(parentId),
        },
      });

    if (!subCategory) {
      throw new NotFoundException(
        'Course sub-category not found',
      );
    }

    const updated =
      await this.prisma.course_categories.update({
        where: {
          id: BigInt(subCategoryId),
        },
        data: {
          status: dto.status,
          updated_at: new Date(),
        },
      });

    return {
      status: 'success',
      message: 'Course sub-category updated successfully',
      data: {
        ...updated,
        id: updated.id.toString(),
        parent_id:
          updated.parent_id?.toString() ?? null,
      },
    };
  }

  async remove(
    parentId: string,
    subCategoryId: string,
  ) {
    const subCategory =
      await this.prisma.course_categories.findFirst({
        where: {
          id: BigInt(subCategoryId),
          parent_id: BigInt(parentId),
        },
      });

    if (!subCategory) {
      throw new NotFoundException(
        'Course sub-category not found',
      );
    }

    const hasCourses =
      await this.prisma.courses.findFirst({
        where: {
          category_id: BigInt(subCategoryId),
        },
      });

    if (hasCourses) {
      throw new ConflictException(
        'Category can not be deleted because it has courses',
      );
    }

    await this.prisma.course_category_translations.deleteMany({
      where: {
        course_category_id: BigInt(subCategoryId),
      },
    });

    await this.prisma.course_categories.delete({
      where: {
        id: BigInt(subCategoryId),
      },
    });

    return {
      status: 'success',
      message: 'Course sub-category deleted successfully',
    };
  }

  async statusUpdate(id: string) {
    const category =
      await this.prisma.course_categories.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Course sub-category not found',
      );
    }

    const updated =
      await this.prisma.course_categories.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: !category.status,
          updated_at: new Date(),
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updated,
        id: updated.id.toString(),
        parent_id:
          updated.parent_id?.toString() ?? null,
      },
    };
  }
}