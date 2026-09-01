import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBlogs(query: {
    keyword?: string;
    language?: string;
    is_popular?: string;
    show_homepage?: string;
    status?: string;
    order_by?: string;
    page?: string;
    per_page?: string;
  }) {
    const {
      keyword,
      language,
      is_popular,
      show_homepage,
      status,
      order_by,
      page = '1',
      per_page = '15',
    } = query;

    const where: any = {};

    if (is_popular !== undefined) {
      where.is_popular = is_popular === '1' || is_popular === 'true';
    }

    if (show_homepage !== undefined) {
      where.show_homepage =
        show_homepage === '1' || show_homepage === 'true';
    }

    if (status !== undefined) {
      where.status = status === '1' || status === 'true';
    }

    const sortOrder = order_by === '1' ? 'asc' : 'desc';

    const pageNumber = Math.max(Number(page) || 1, 1);

    const take =
      per_page === 'all'
        ? undefined
        : Math.max(Number(per_page) || 15, 1);

    const skip =
      take !== undefined ? (pageNumber - 1) * take : undefined;

    const blogs = await this.prisma.blogs.findMany({
      where,
      orderBy: {
        id: sortOrder,
      },
      ...(take !== undefined && {
        skip,
        take,
      }),
    });

    const blogIds = blogs.map((blog) => blog.id);

    const translations =
      blogIds.length > 0
        ? await this.prisma.blog_translations.findMany({
            where: {
              blog_id: {
                in: blogIds,
              },
              ...(language && {
                lang_code: language,
              }),
              ...(keyword && {
                OR: [
                  {
                    title: {
                      contains: keyword,
                    },
                  },
                  {
                    description: {
                      contains: keyword,
                    },
                  },
                ],
              }),
            },
          })
        : [];

    let filteredBlogs = blogs;

    if (keyword || language) {
      const matchingBlogIds = new Set(
        translations.map((translation) =>
          translation.blog_id.toString(),
        ),
      );

      filteredBlogs = blogs.filter((blog) =>
        matchingBlogIds.has(blog.id.toString()),
      );
    }

    const result = filteredBlogs.map((blog) => {
      const blogTranslations = translations.filter(
        (translation) =>
          translation.blog_id.toString() === blog.id.toString(),
      );

      return {
        ...blog,
        id: blog.id.toString(),
        views: blog.views.toString(),
        translations: blogTranslations.map((translation) => ({
          ...translation,
          id: translation.id.toString(),
          blog_id: translation.blog_id.toString(),
        })),
      };
    });

    const total =
      keyword || language
        ? filteredBlogs.length
        : await this.prisma.blogs.count({ where });

    return {
      data: result,
      pagination:
        per_page === 'all'
          ? null
          : {
              current_page: pageNumber,
              per_page: take,
              total,
              last_page: take ? Math.ceil(total / take) : 1,
            },
    };
  }

  async createBlog(
    data: CreateBlogDto,
    adminId: bigint,
  ) {
    const blog = await this.prisma.blogs.create({
      data: {
        admin_id: adminId,
        blog_category_id: BigInt(data.blog_category_id),
        slug: data.slug,
        tags: data.tags ?? null,
        show_homepage: data.show_homepage ?? false,
        is_popular: data.is_popular ?? false,
        status: data.status ?? false,
        image: data.image ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (data.lang_code) {
      await this.prisma.blog_translations.create({
        data: {
          blog_id: blog.id,
          lang_code: data.lang_code,
          title: data.title ?? '',
          description: data.description ?? '',
          seo_title: data.seo_title ?? null,
          seo_description: data.seo_description ?? null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    return {
      ...blog,
      id: blog.id.toString(),
      admin_id: blog.admin_id.toString(),
      blog_category_id: blog.blog_category_id.toString(),
      views: blog.views.toString(),
    };
  }

   async update(
    id: string,
    dto: UpdateBlogDto,
  ) {
    const blogId = BigInt(id);

    /*
     * Check blog
     */
    const blog =
      await this.prisma.blogs.findUnique({
        where: {
          id: blogId,
        },
      });

    if (!blog) {
      throw new NotFoundException(
        'Blog not found',
      );
    }

    /*
     * Validate category if provided
     */
    if (dto.blog_category_id !== undefined) {
      const category =
        await this.prisma.blog_categories.findUnique({
          where: {
            id: BigInt(dto.blog_category_id),
          },
          select: {
            id: true,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'Blog category not found',
        );
      }
    }

    /*
     * Update blog fields
     */
    const updatedBlog =
      await this.prisma.blogs.update({
        where: {
          id: blogId,
        },

        data: {
          ...(dto.blog_category_id !== undefined && {
            blog_category_id:
              BigInt(dto.blog_category_id),
          }),

          ...(dto.slug !== undefined && {
            slug: dto.slug,
          }),

          ...(dto.tags !== undefined && {
            tags: dto.tags,
          }),

          ...(dto.show_homepage !== undefined && {
            show_homepage:
              dto.show_homepage,
          }),

          ...(dto.is_popular !== undefined && {
            is_popular:
              dto.is_popular,
          }),

          ...(dto.status !== undefined && {
            status: dto.status,
          }),
        },
      });

    /*
     * Update translation
     *
     * Laravel:
     * $this->updateTranslations(
     *     $blog,
     *     $request,
     *     $validatedData
     * );
     */
    if (
      dto.lang_code !== undefined &&
      dto.lang_code.trim() !== ''
    ) {
      const translation =
        await this.prisma.blog_translations.findFirst({
          where: {
            blog_id: blogId,
            lang_code: dto.lang_code,
          },
        });

      if (translation) {
        await this.prisma.blog_translations.update({
          where: {
            id: translation.id,
          },

          data: {
            ...(dto.title !== undefined && {
              title: dto.title,
            }),

            ...(dto.description !== undefined && {
              description:
                dto.description,
            }),

            ...(dto.seo_title !== undefined && {
              seo_title:
                dto.seo_title,
            }),

            ...(dto.seo_description !==
              undefined && {
              seo_description:
                dto.seo_description,
            }),
          },
        });
      } else {
        /*
         * If translation doesn't exist,
         * create it.
         */
        await this.prisma.blog_translations.create({
          data: {
            blog_id: blogId,
            lang_code: dto.lang_code,

            title: dto.title ?? '',

            description:
              dto.description ?? '',

            seo_title:
              dto.seo_title ?? null,

            seo_description:
              dto.seo_description ?? null,
          },
        });
      }
    }

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: {
        id: updatedBlog.id.toString(),
      },
    };
  }

  /**
   * Delete blog
   *
   * Laravel equivalent:
   * BlogController@destroy
   */
  async remove(id: string) {
    const blogId = BigInt(id);

    /*
     * Check blog
     */
    const blog =
      await this.prisma.blogs.findUnique({
        where: {
          id: blogId,
        },
      });

    if (!blog) {
      throw new NotFoundException(
        'Blog not found',
      );
    }

    /*
     * Delete translations first
     */
    await this.prisma.blog_translations.deleteMany({
      where: {
        blog_id: blogId,
      },
    });

    /*
     * Delete blog
     *
     * Image deletion should be handled
     * separately from DB transaction.
     */
    await this.prisma.blogs.delete({
      where: {
        id: blogId,
      },
    });

    return {
      status: 'success',
      message: 'Deleted Successfully',
    };
  }

  /**
 * Get blog by ID
 */
async findOne(id: string) {
  const blogId = BigInt(id);

  /*
   * Get blog
   */
  const blog = await this.prisma.blogs.findUnique({
    where: {
      id: blogId,
    },
    select: {
      id: true,
      admin_id: true,
      blog_category_id: true,
      slug: true,
      image: true,
      views: true,
      show_homepage: true,
      is_popular: true,
      tags: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!blog) {
    throw new NotFoundException(
      'Blog not found',
    );
  }

  /*
   * Get translations
   */
  const translations =
    await this.prisma.blog_translations.findMany({
      where: {
        blog_id: blogId,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        blog_id: true,
        lang_code: true,
        title: true,
        description: true,
        seo_title: true,
        seo_description: true,
        created_at: true,
        updated_at: true,
      },
    });

  /*
   * Get category
   *
   * blogs -> blog_category_id
   * is not defined as a Prisma relation,
   * so fetch it separately.
   */
  const category =
    await this.prisma.blog_categories.findUnique({
      where: {
        id: blog.blog_category_id,
      },
      select: {
        id: true,
        slug: true,
        position: true,
        parent_id: true,
        status: true,
      },
    });

  /*
   * Get category translations
   */
  const categoryTranslations =
    category
      ? await this.prisma.blog_category_translations.findMany({
          where: {
            blog_category_id: category.id,
          },
          orderBy: {
            id: 'asc',
          },
          select: {
            id: true,
            blog_category_id: true,
            lang_code: true,
            title: true,
            short_description: true,
          },
        })
      : [];

  return {
    status: 'success',

    data: {
      id: blog.id.toString(),

      admin_id:
        blog.admin_id.toString(),

      blog_category_id:
        blog.blog_category_id.toString(),

      slug: blog.slug,

      image: blog.image,

      views: blog.views.toString(),

      show_homepage:
        blog.show_homepage,

      is_popular:
        blog.is_popular,

      tags: blog.tags,

      status: blog.status,

      created_at:
        blog.created_at,

      updated_at:
        blog.updated_at,

      category: category
        ? {
            id: category.id.toString(),
            slug: category.slug,
            position: category.position,
            parent_id: category.parent_id,
            status: category.status,

            translations:
              categoryTranslations.map(
                (translation) => ({
                  id:
                    translation.id.toString(),
                  lang_code:
                    translation.lang_code,
                  title:
                    translation.title,
                  short_description:
                    translation.short_description,
                }),
              ),
          }
        : null,

      translations:
        translations.map(
          (translation) => ({
            id:
              translation.id.toString(),
            blog_id:
              translation.blog_id.toString(),
            lang_code:
              translation.lang_code,
            title:
              translation.title,
            description:
              translation.description,
            seo_title:
              translation.seo_title,
            seo_description:
              translation.seo_description,
            created_at:
              translation.created_at,
            updated_at:
              translation.updated_at,
          }),
        ),
    },
  };
}
}