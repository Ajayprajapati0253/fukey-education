import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFreeCourseCategoryDto } from '../dto/create-free-course-category.dto';
import { UpdateFreeCourseCategoryDto } from '../dto/update-free-course-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FreeCourseCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List categories
   */
  async findAll(query: any) {
    const {
      keyword,
      parent_id,
      status,
      order_by,
      'par-page': perPage,
      page = 1,
    } = query;

    const where: any = {};

    /**
     * Laravel:
     * where('parent_id', $request->parent_id)
     *
     * If parent_id is not provided, Laravel/Eloquent treats
     * null as IS NULL.
     */
    if (
      parent_id === undefined ||
      parent_id === null ||
      parent_id === ''
    ) {
      where.parent_id = null;
    } else {
      where.parent_id = BigInt(parent_id);
    }

    /**
     * Search by translation name
     */
    if (keyword) {
      where.id = {
        in: await this.getCategoryIdsByKeyword(keyword),
      };
    }

    /**
     * Status filter
     */
    if (status !== undefined && status !== '') {
      where.status =
        status === 'true' || status === '1';
    }

    const order = Number(order_by) === 1 ? 'asc' : 'desc';

    /**
     * Laravel:
     * par-page=all
     */
    if (perPage === 'all') {
      const categories =
        await this.prisma.free_course_categories.findMany({
          where,
          orderBy: {
            id: order,
          },
        });

      return {
        data: await this.attachTranslations(categories),
        pagination: null,
      };
    }

    const take = perPage
      ? Number(perPage)
      : 10;

    const currentPage = Math.max(
      Number(page) || 1,
      1,
    );

    const skip = (currentPage - 1) * take;

    const [categories, total] =
      await Promise.all([
        this.prisma.free_course_categories.findMany({
          where,
          orderBy: {
            id: order,
          },
          skip,
          take,
        }),

        this.prisma.free_course_categories.count({
          where,
        }),
      ]);

    return {
      data: await this.attachTranslations(categories),
      pagination: {
        current_page: currentPage,
        per_page: take,
        total,
        last_page: Math.ceil(total / take),
      },
    };
  }

  /**
   * Create category
   */
  async create(
    dto: CreateFreeCourseCategoryDto,
    icon?: Express.Multer.File,
  ) {
    const existing =
      await this.prisma.free_course_categories.findFirst({
        where: {
          slug: dto.slug,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'The slug has already been taken.',
      );
    }

    const iconPath = icon
      ? icon.filename
      : null;

    const category =
      await this.prisma.free_course_categories.create({
        data: {
          slug: dto.slug,
          icon: iconPath,
          status: dto.status,
          show_at_trending:
            dto.show_at_trending,
          parent_id: dto.parent_id
            ? BigInt(dto.parent_id)
            : null,
        },
      });

    /**
     * Laravel GenerateTranslationTrait:
     *
     * Language::all()
     * create translation for every language
     */
    const languages =
      await this.prisma.languages.findMany();

    if (languages.length > 0) {
      await this.prisma
        .free_course_category_translations
        .createMany({
          data: languages.map((language) => ({
            free_course_category_id:
              category.id,
            lang_code: language.code,
            name: dto.name,
          })),
        });
    }

    return this.serializeCategory(
      await this.getCategory(category.id),
    );
  }

  /**
   * Get single category
   */
  async findOne(id: string) {
    const category =
      await this.getCategory(BigInt(id));

    if (!category) {
      throw new NotFoundException(
        'Free course category not found.',
      );
    }

    return this.serializeCategory(category);
  }

  /**
   * Update category
   */
  async update(
    id: string,
    dto: UpdateFreeCourseCategoryDto,
    icon?: Express.Multer.File,
  ) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.free_course_categories.findUnique(
        {
          where: {
            id: categoryId,
          },
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Free course category not found.',
      );
    }

    const data: any = {};

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.show_at_trending !== undefined) {
      data.show_at_trending =
        dto.show_at_trending;
    }

    if (icon) {
      data.icon = icon.filename;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.free_course_categories.update({
        where: {
          id: categoryId,
        },
        data,
      });
    }

    /**
     * Laravel updateTranslations():
     *
     * Find translation by lang_code.
     * If exists -> update.
     * Otherwise -> create.
     */
    const translation =
      await this.prisma
        .free_course_category_translations
        .findFirst({
          where: {
            free_course_category_id:
              categoryId,
            lang_code: dto.code,
          },
        });

    if (translation) {
      await this.prisma
        .free_course_category_translations
        .update({
          where: {
            id: translation.id,
          },
          data: {
            name: dto.name,
          },
        });
    } else {
      await this.prisma
        .free_course_category_translations
        .create({
          data: {
            free_course_category_id:
              categoryId,
            lang_code: dto.code,
            name: dto.name,
          },
        });
    }

    return this.serializeCategory(
      await this.getCategory(categoryId),
    );
  }

  /**
   * Delete category
   */
  async remove(id: string) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.free_course_categories.findUnique(
        {
          where: {
            id: categoryId,
          },
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Free course category not found.',
      );
    }

    /**
     * Laravel:
     * if child categories exist,
     * category cannot be deleted.
     */
    const child =
      await this.prisma.free_course_categories.findFirst({
        where: {
          parent_id: categoryId,
        },
      });

    if (child) {
      throw new BadRequestException(
        'Category can not be deleted because it has sub categories',
      );
    }

    await this.prisma
      .free_course_category_translations
      .deleteMany({
        where: {
          free_course_category_id:
            categoryId,
        },
      });

    await this.prisma.free_course_categories.delete({
      where: {
        id: categoryId,
      },
    });

    return {
      success: true,
      message: 'Deleted Successfully',
    };
  }

  /**
   * Toggle status
   */
  async statusUpdate(id: string) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.free_course_categories.findUnique(
        {
          where: {
            id: categoryId,
          },
        },
      );

    if (!category) {
      throw new NotFoundException(
        'Free course category not found.',
      );
    }

    await this.prisma.free_course_categories.update({
      where: {
        id: categoryId,
      },
      data: {
        status: !category.status,
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
    };
  }

  /**
   * Search translation IDs
   */
  private async getCategoryIdsByKeyword(
    keyword: string,
  ): Promise<bigint[]> {
    const translations =
      await this.prisma
        .free_course_category_translations
        .findMany({
          where: {
            name: {
              contains: keyword,
            },
          },
          select: {
            free_course_category_id: true,
          },
        });

    return translations.map(
      (item) => item.free_course_category_id,
    );
  }

  /**
   * Get category with translations
   */
  private async getCategory(id: bigint) {
    const category =
      await this.prisma.free_course_categories.findUnique({
        where: {
          id,
        },
      });

    if (!category) {
      return null;
    }

    const translations =
      await this.prisma
        .free_course_category_translations
        .findMany({
          where: {
            free_course_category_id: id,
          },
          orderBy: {
            id: 'asc',
          },
        });

    return {
      ...category,
      translations,
    };
  }

  /**
   * Attach translations to list
   */
  private async attachTranslations(
    categories: any[],
  ) {
    if (!categories.length) {
      return [];
    }

    const ids = categories.map(
      (category) => category.id,
    );

    const translations =
      await this.prisma
        .free_course_category_translations
        .findMany({
          where: {
            free_course_category_id: {
              in: ids,
            },
          },
        });

    return categories.map((category) => ({
      ...category,
      translations: translations.filter(
        (translation) =>
          translation.free_course_category_id ===
          category.id,
      ),
    }));
  }

  /**
   * Convert BigInt values to string
   */
  private serializeCategory(category: any) {
    if (!category) {
      return null;
    }

    return JSON.parse(
      JSON.stringify(category, (_, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value,
      ),
    );
  }
}