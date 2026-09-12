import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../dto/update-blog-category.dto';

@Injectable()
export class BlogCategoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all blog categories
   *
   * Laravel:
   * BlogCategoryController@index
   */
  async findAll(page = 1, limit = 15) {
    const skip = (page - 1) * limit;

    const [total, categories] =
      await this.prisma.$transaction([
        this.prisma.blog_categories.count(),

        this.prisma.blog_categories.findMany({
          skip,
          take: limit,
          orderBy: {
            id: 'desc',
          },
          include: {
            blog_category_translations: true,
          },
        }),
      ]);

    const lastPage =
      total > 0 ? Math.ceil(total / limit) : 0;

    return {
      status: 'success',
      data: categories.map((category) => ({
        ...category,
        id: category.id.toString(),
        translations:
          category.blog_category_translations.map(
            (translation) => ({
              ...translation,
              id: translation.id.toString(),
              blog_category_id:
                translation.blog_category_id.toString(),
            }),
          ),
      })),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: lastPage,
      },
    };
  }

  /**
   * Get blog category by ID
   *
   * Laravel equivalent:
   * edit()
   */
  async findOne(id: string) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.blog_categories.findUnique({
        where: {
          id: categoryId,
        },
        include: {
          blog_category_translations: true,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Blog category not found',
      );
    }

    return {
      status: 'success',
      data: {
        ...category,
        id: category.id.toString(),
        translations:
          category.blog_category_translations.map(
            (translation) => ({
              ...translation,
              id: translation.id.toString(),
              blog_category_id:
                translation.blog_category_id.toString(),
            }),
          ),
      },
    };
  }

  /**
   * Create blog category
   *
   * Laravel equivalent:
   * store()
   */
  async create(dto: CreateBlogCategoryDto) {
    const {
      lang_code,
      title,
      short_description,
      ...categoryData
    } = dto;

    const category =
      await this.prisma.blog_categories.create({
        data: {
          slug: categoryData.slug,
          position: categoryData.position ?? 0,
          parent_id: categoryData.parent_id ?? null,
          status: categoryData.status ?? true,

          ...(lang_code && title
            ? {
                blog_category_translations: {
                  create: {
                    lang_code,
                    title,
                    short_description:
                      short_description ?? null,
                  },
                },
              }
            : {}),
        },

        include: {
          blog_category_translations: true,
        },
      });

    return {
      status: 'success',
      message: 'Blog category created successfully',
      data: {
        ...category,
        id: category.id.toString(),
        translations:
          category.blog_category_translations.map(
            (translation) => ({
              ...translation,
              id: translation.id.toString(),
              blog_category_id:
                translation.blog_category_id.toString(),
            }),
          ),
      },
    };
  }

  /**
   * Update blog category
   *
   * Laravel equivalent:
   * update()
   */
async update(
  id: string,
  dto: UpdateBlogCategoryDto,
) {
  const categoryId = BigInt(id);

  const existing =
    await this.prisma.blog_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      'Blog category not found',
    );
  }

  const category =
    await this.prisma.blog_categories.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(dto.slug !== undefined && {
          slug: dto.slug,
        }),

        ...(dto.position !== undefined && {
          position: dto.position,
        }),

        ...(dto.parent_id !== undefined && {
          parent_id: dto.parent_id,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),
      },

      include: {
        blog_category_translations: true,
      },
    });

  /*
   * Laravel:
   * $this->updateTranslations(...)
   *
   * For supplied language, update existing
   * translation or create it if it doesn't exist.
   */
  if (dto.lang_code && dto.title) {
    const translation =
      await this.prisma.blog_category_translations.findFirst({
        where: {
          blog_category_id: categoryId,
          lang_code: dto.lang_code,
        },
      });

    if (translation) {
      await this.prisma.blog_category_translations.update({
        where: {
          id: translation.id,
        },
        data: {
          title: dto.title,
          short_description:
            dto.short_description ?? null,
        },
      });
    } else {
      await this.prisma.blog_category_translations.create({
        data: {
          blog_category_id: categoryId,
          lang_code: dto.lang_code,
          title: dto.title,
          short_description:
            dto.short_description ?? null,
        },
      });
    }
  }

  const updated =
    await this.prisma.blog_categories.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        blog_category_translations: true,
      },
    });

  return {
    status: 'success',
    message: 'Blog category updated successfully',
    data: {
      ...updated,
      id: updated!.id.toString(),
      translations:
        updated!.blog_category_translations.map(
          (translation) => ({
            ...translation,
            id: translation.id.toString(),
            blog_category_id:
              translation.blog_category_id.toString(),
          }),
        ),
    },
  };
}

  /**
   * Delete blog category
   *
   * Laravel equivalent:
   * destroy()
   */
  async remove(id: string) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.blog_categories.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Blog category not found',
      );
    }

    /*
     * Laravel:
     * if ($blogCategory->posts()->count() > 0)
     *
     * We need to check whether blogs exist
     * for this category.
     */
    const posts = await this.prisma.blogs.count({
      where: {
        blog_category_id: categoryId,
      },
    });

    if (posts > 0) {
      throw new BadRequestException(
        'Can not delete this category because it has posts',
      );
    }

    await this.prisma.$transaction([
      this.prisma.blog_category_translations.deleteMany({
        where: {
          blog_category_id: categoryId,
        },
      }),

      this.prisma.blog_categories.delete({
        where: {
          id: categoryId,
        },
      }),
    ]);

    return {
      status: 'success',
      message: 'Blog category deleted successfully',
    };
  }

  /**
   * Toggle category status
   *
   * Laravel equivalent:
   * statusUpdate()
   */
  async statusUpdate(id: string) {
    const categoryId = BigInt(id);

    const category =
      await this.prisma.blog_categories.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Blog category not found',
      );
    }

    const updated =
      await this.prisma.blog_categories.update({
        where: {
          id: categoryId,
        },
        data: {
          status: !category.status,
        },
        select: {
          id: true,
          status: true,
        },
      });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: {
        id: updated.id.toString(),
        status: updated.status,
      },
    };
  }
}