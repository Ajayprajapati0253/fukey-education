import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseCategoryDto } from '../dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from '../dto/update-course-category.dto';

@Injectable()
export class CourseCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    keyword?: string,
    parentId?: string,
    status?: string,
    page = 1,
    limit = 15,
    orderBy?: string,
  ) {
    const where: any = {};

    if (parentId !== undefined && parentId !== '') {
      where.parent_id = BigInt(parentId);
    } else {
      where.parent_id = null;
    }

    if (status !== undefined && status !== '') {
      where.status = status === '1' || status === 'true';
    }

    if (keyword) {
      const matchingTranslations =
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

      const categoryIds = matchingTranslations.map(
        (translation) => translation.course_category_id,
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

      where.id = {
        in: categoryIds,
      };
    }

    const order = orderBy === '1' ? 'asc' : 'desc';

    const [total, categories] = await this.prisma.$transaction([
      this.prisma.course_categories.count({ where }),

      this.prisma.course_categories.findMany({
        where,
        orderBy: {
          id: order,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data = await Promise.all(
      categories.map(async (category) => {
        const translations =
          await this.prisma.course_category_translations.findMany({
            where: {
              course_category_id: category.id,
            },
          });

        return {
          ...category,
          id: category.id.toString(),
          parent_id: category.parent_id?.toString() ?? null,
          translations: translations.map((translation) => ({
            ...translation,
            id: translation.id.toString(),
            course_category_id:
              translation.course_category_id.toString(),
          })),
        };
      }),
    );

    return {
      status: 'success',
      data,
      meta: {
        current_page: page,
        last_page: total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async create(dto: CreateCourseCategoryDto) {
    const existingCategory = await this.prisma.course_categories.findFirst({
      where: {
        slug: dto.slug,
      },
    });

    if (existingCategory) {
      throw new ConflictException('The slug has already been taken.');
    }

    const category = await this.prisma.course_categories.create({
      data: {
        slug: dto.slug,
        status: dto.status,
        show_at_trending: dto.show_at_trending,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Laravel generates the translation from the `name` field.
    // Default language code is used here; controller can pass the code
    // later if your project requires a specific language.
    await this.prisma.course_category_translations.create({
      data: {
        course_category_id: category.id,
        lang_code: 'en',
        name: dto.name,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course category created successfully',
      data: {
        ...category,
        id: category.id.toString(),
        parent_id: category.parent_id?.toString() ?? null,
      },
    };
  }

  async update(id: string, dto: UpdateCourseCategoryDto) {
    const categoryId = BigInt(id);

    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Course category not found');
    }

    await this.prisma.course_categories.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        updated_at: new Date(),
      },
    });

    const translation =
      await this.prisma.course_category_translations.findFirst({
        where: {
          course_category_id: categoryId,
          lang_code: dto.code,
        },
      });

    if (translation) {
      await this.prisma.course_category_translations.update({
        where: {
          id: translation.id,
        },
        data: {
          name: dto.name,
          updated_at: new Date(),
        },
      });
    } else {
      await this.prisma.course_category_translations.create({
        data: {
          course_category_id: categoryId,
          lang_code: dto.code,
          name: dto.name,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    const updatedCategory =
      await this.prisma.course_categories.findUnique({
        where: {
          id: categoryId,
        },
      });

    return {
      status: 'success',
      message: 'Course category updated successfully',
      data: {
        ...updatedCategory,
        id: updatedCategory!.id.toString(),
        parent_id: updatedCategory!.parent_id?.toString() ?? null,
      },
    };
  }

  async remove(id: string) {
    const categoryId = BigInt(id);

    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Course category not found');
    }

    const hasSubCategories =
      await this.prisma.course_categories.findFirst({
        where: {
          parent_id: categoryId,
        },
      });

    if (hasSubCategories) {
      throw new ConflictException(
        'Category can not be deleted because it has sub categories',
      );
    }

    await this.prisma.course_category_translations.deleteMany({
      where: {
        course_category_id: categoryId,
      },
    });

    await this.prisma.course_categories.delete({
      where: {
        id: categoryId,
      },
    });

    return {
      status: 'success',
      message: 'Course category deleted successfully',
    };
  }

  async statusUpdate(id: string) {
    const categoryId = BigInt(id);

    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Course category not found');
    }

    const newStatus = !category.status;

    await this.prisma.course_categories.update({
      where: {
        id: categoryId,
      },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
    };
  }
}