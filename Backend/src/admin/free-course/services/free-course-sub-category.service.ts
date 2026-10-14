import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateFreeCourseSubCategoryDto } from '../dto/create-free-course-sub-category.dto';
import { UpdateFreeCourseSubCategoryDto } from '../dto/update-free-course-sub-category.dto';

@Injectable()
export class FreeCourseSubCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    parentId: number,
    query: {
      keyword?: string;
      status?: string;
      order_by?: string;
      page?: number;
      per_page?: number;
      par_page?: string;
      lang_code?: string;
    },
  ) {
    const {
      keyword,
      status,
      order_by,
      page = 1,
      per_page = 10,
      par_page,
      lang_code,
    } = query;

    const parentCategory =
      await this.prisma.free_course_categories.findUnique({
        where: {
          id: BigInt(parentId),
        },
      });

    if (!parentCategory) {
      throw new NotFoundException(
        'Parent category not found',
      );
    }

    const where: any = {
      parent_id: BigInt(parentId),
    };

    if (
      status !== undefined &&
      status !== ''
    ) {
      if (status === '1' || status === 'true') {
        where.status = true;
      } else if (
        status === '0' ||
        status === 'false'
      ) {
        where.status = false;
      }
    }

    /*
     * Laravel:
     * whereHas('translations')
     * where translation.name LIKE keyword
     */
    if (keyword) {
      const translations =
        await this.prisma.free_course_category_translations.findMany(
          {
            where: {
              name: {
                contains: keyword,
              },
              ...(lang_code
                ? { lang_code }
                : {}),
            },
            select: {
              free_course_category_id: true,
            },
          },
        );

      where.id = {
        in: translations.map(
          (item) =>
            item.free_course_category_id,
        ),
      };
    }

    const orderDirection =
      order_by === '1' ? 'asc' : 'desc';

    let categories;

    if (par_page === 'all') {
      categories =
        await this.prisma.free_course_categories.findMany(
          {
            where,
            orderBy: {
              id: orderDirection,
            },
          },
        );
    } else {
      categories =
        await this.prisma.free_course_categories.findMany(
          {
            where,
            orderBy: {
              id: orderDirection,
            },
            skip: (page - 1) * per_page,
            take: per_page,
          },
        );
    }

    const categoryIds = categories.map(
      (category) => category.id,
    );

    const translations =
      categoryIds.length > 0
        ? await this.prisma.free_course_category_translations.findMany(
            {
              where: {
                free_course_category_id: {
                  in: categoryIds,
                },
                ...(lang_code
                  ? { lang_code }
                  : {}),
              },
              orderBy: {
                id: 'asc',
              },
            },
          )
        : [];

    const data = categories.map(
      (category) => ({
        ...category,
        id: Number(category.id),
        parent_id: category.parent_id
          ? Number(category.parent_id)
          : null,
        translations: translations
          .filter(
            (translation) =>
              translation.free_course_category_id ===
              category.id,
          )
          .map((translation) => ({
            ...translation,
            id: Number(translation.id),
            free_course_category_id: Number(
              translation.free_course_category_id,
            ),
          })),
      }),
    );

    if (par_page === 'all') {
      return {
        status: 'success',
        data,
        parent_category: {
          ...parentCategory,
          id: Number(parentCategory.id),
          parent_id: parentCategory.parent_id
            ? Number(parentCategory.parent_id)
            : null,
        },
      };
    }

    const total =
      await this.prisma.free_course_categories.count({
        where,
      });

    return {
      status: 'success',
      data,
      parent_category: {
        ...parentCategory,
        id: Number(parentCategory.id),
        parent_id: parentCategory.parent_id
          ? Number(parentCategory.parent_id)
          : null,
      },
      pagination: {
        current_page: page,
        per_page,
        total,
        last_page: Math.ceil(
          total / per_page,
        ),
      },
    };
  }

  async findOne(
    parentId: number,
    subCategoryId: number,
    langCode?: string,
  ) {
    const category =
      await this.prisma.free_course_categories.findFirst(
        {
          where: {
            id: BigInt(subCategoryId),
            parent_id: BigInt(parentId),
          },
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Free course sub category not found',
      );
    }

    const translations =
      await this.prisma.free_course_category_translations.findMany(
        {
          where: {
            free_course_category_id:
              BigInt(subCategoryId),
            ...(langCode
              ? { lang_code: langCode }
              : {}),
          },
          orderBy: {
            id: 'asc',
          },
        },
      );

    return {
      status: 'success',
      data: {
        ...category,
        id: Number(category.id),
        parent_id: category.parent_id
          ? Number(category.parent_id)
          : null,
        translations:
          translations.map((translation) => ({
            ...translation,
            id: Number(translation.id),
            free_course_category_id: Number(
              translation.free_course_category_id,
            ),
          })),
      },
    };
  }

  async create(
    parentId: number,
    dto: CreateFreeCourseSubCategoryDto,
  ) {
    const parentCategory =
      await this.prisma.free_course_categories.findUnique(
        {
          where: {
            id: BigInt(parentId),
          },
        },
      );

    if (!parentCategory) {
      throw new NotFoundException(
        'Parent category not found',
      );
    }

    const existing =
      await this.prisma.free_course_categories.findFirst(
        {
          where: {
            slug: dto.slug,
          },
        },
      );

    if (existing) {
      throw new BadRequestException(
        'The slug has already been taken.',
      );
    }

    const subCategory =
      await this.prisma.free_course_categories.create({
        data: {
          slug: dto.slug,
          parent_id: BigInt(parentId),
          status: dto.status,
        },
      });

    return {
      status: 'success',
      message: 'Created successfully',
      data: {
        ...subCategory,
        id: Number(subCategory.id),
        parent_id: subCategory.parent_id
          ? Number(subCategory.parent_id)
          : null,
      },
    };
  }

  async update(
    parentId: number,
    subCategoryId: number,
    dto: UpdateFreeCourseSubCategoryDto,
  ) {
    const category =
      await this.prisma.free_course_categories.findFirst(
        {
          where: {
            id: BigInt(subCategoryId),
            parent_id: BigInt(parentId),
          },
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Free course sub category not found',
      );
    }

    const updated =
      await this.prisma.free_course_categories.update({
        where: {
          id: BigInt(subCategoryId),
        },
        data: {
          status: dto.status,
        },
      });

    /*
     * Laravel updateTranslations() updates the translation
     * for the requested language code.
     */
    const language =
      await this.prisma.free_course_category_translations.findFirst(
        {
          where: {
            free_course_category_id:
              BigInt(subCategoryId),
            lang_code: dto.code,
          },
        },
      );

    if (language) {
      await this.prisma.free_course_category_translations.update(
        {
          where: {
            id: language.id,
          },
          data: {
            name: dto.name,
          },
        },
      );
    } else {
      await this.prisma.free_course_category_translations.create(
        {
          data: {
            free_course_category_id:
              BigInt(subCategoryId),
            lang_code: dto.code,
            name: dto.name,
          },
        },
      );
    }

    return {
      status: 'success',
      message: 'Updated successfully',
      data: {
        ...updated,
        id: Number(updated.id),
        parent_id: updated.parent_id
          ? Number(updated.parent_id)
          : null,
      },
    };
  }

  async remove(
    parentId: number,
    subCategoryId: number,
  ) {
    const subCategory =
      await this.prisma.free_course_categories.findFirst(
        {
          where: {
            id: BigInt(subCategoryId),
            parent_id: BigInt(parentId),
          },
        },
      );

    if (!subCategory) {
      throw new NotFoundException(
        'Free course sub category not found',
      );
    }

    const course =
      await this.prisma.free_courses.findFirst({
        where: {
          category_id: BigInt(subCategoryId),
        },
      });

    if (course) {
      throw new BadRequestException(
        'Category can not be deleted because it has courses',
      );
    }

    await this.prisma.$transaction([
      this.prisma.free_course_category_translations.deleteMany(
        {
          where: {
            free_course_category_id:
              BigInt(subCategoryId),
          },
        },
      ),

      this.prisma.free_course_categories.delete({
        where: {
          id: BigInt(subCategoryId),
        },
      }),
    ]);

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }

  async statusUpdate(id: number) {
    const subCategory =
      await this.prisma.free_course_categories.findUnique(
        {
          where: {
            id: BigInt(id),
          },
        },
      );

    if (!subCategory) {
      throw new NotFoundException(
        'Free course sub category not found',
      );
    }

    const updated =
      await this.prisma.free_course_categories.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: !subCategory.status,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        ...updated,
        id: Number(updated.id),
        parent_id: updated.parent_id
          ? Number(updated.parent_id)
          : null,
      },
    };
  }
}