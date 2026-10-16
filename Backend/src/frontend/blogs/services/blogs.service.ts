import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GetBlogsDto } from '../dto/get-blogs.dto';
import { SubmitBlogCommentDto } from '../dto/submit-blog-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /blogs
   * Fetch active blogs with search, category, language and pagination.
   */
  async findAll(query: GetBlogsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 9));
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const category = query.category?.trim();
    const langCode = query.blog_lang?.trim();

    const where: any = {
      status: true,
      blog_category: {
        is: {
          status: true,
        },
      },
    };

    // Search by translated title or description.
    if (search) {
      where.blog_translations = {
        some: {
          OR: [
            {
              title: {
                contains: search,
              },
            },
            {
              description: {
                contains: search,
              },
            },
          ],
          ...(langCode ? { lang_code: langCode } : {}),
        },
      };
    } else if (langCode) {
      // Filter blogs by language.
      where.blog_translations = {
        some: {
          lang_code: langCode,
        },
      };
    }

    // Filter by category slug.
    if (category) {
      where.blog_category = {
        is: {
          status: true,
          slug: category,
        },
      };
    }

    const [blogs, total, categories, popularBlogs] =
      await Promise.all([
        // Paginated blogs.
        this.prisma.blogs.findMany({
          where,
          include: {
            blog_translations: true,
            blog_category: {
              include: {
                blog_category_translations: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),

        // Total matching blogs.
        this.prisma.blogs.count({
          where,
        }),

        // Active categories.
        this.prisma.blog_categories.findMany({
          where: {
            status: true,
          },
          include: {
            blog_category_translations: true,
          },
          orderBy: {
            position: 'asc',
          },
        }),

        // Latest eight popular blogs.
        this.prisma.blogs.findMany({
          where: {
            status: true,
            is_popular: true,
            blog_category: {
              is: {
                status: true,
              },
            },
          },
          include: {
            blog_translations: true,
            blog_category: {
              include: {
                blog_category_translations: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 8,
        }),
      ]);

    return {
      status: true,
      message: 'Blogs fetched successfully',
      data: {
        blogs: blogs.map((blog) =>
          this.serializeBlog(blog, langCode),
        ),

        categories: categories.map((item) => ({
          ...item,
          id: item.id.toString(),
        })),

        popularBlogs: popularBlogs.map((blog) =>
          this.serializeBlog(blog, langCode),
        ),

        pagination: {
          current_page: page,
          per_page: limit,
          total,
          last_page: Math.ceil(total / limit),
          has_more_pages: page * limit < total,
        },
      },
    };
  }

  /**
   * GET /blogs/:slug
   * Fetch blog details, latest blogs, categories and approved comments.
   */
  async findBySlug(slug: string, blogLang?: string) {
    const blog = await this.prisma.blogs.findFirst({
      where: {
        slug,
        blog_category: {
          is: {
            status: true,
          },
        },
      },
      include: {
        blog_translations: true,
        blog_category: {
          include: {
            blog_category_translations: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const [latestBlogs, categories, comments] =
      await Promise.all([
        // Latest eight blogs, excluding the current blog.
        this.prisma.blogs.findMany({
          where: {
            status: true,
            id: {
              not: blog.id,
            },
          },
          include: {
            blog_translations: true,
            blog_category: {
              include: {
                blog_category_translations: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 8,
        }),

        // Active categories.
        this.prisma.blog_categories.findMany({
          where: {
            status: true,
          },
          include: {
            blog_category_translations: true,
          },
          orderBy: {
            position: 'asc',
          },
        }),

        // Approved comments only.
        this.prisma.blog_comments.findMany({
          where: {
            blog_id: blog.id,
            status: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
      ]);

    return {
      status: true,
      message: 'Blog details fetched successfully',
      data: {
        blog: this.serializeBlog(blog, blogLang),

        latestBlogs: latestBlogs.map((item) =>
          this.serializeBlog(item, blogLang),
        ),

        categories: categories.map((item) => ({
          ...item,
          id: item.id.toString(),
        })),

        comments: comments.map((comment) => ({
          ...comment,
          id: comment.id.toString(),
          blog_id: comment.blog_id.toString(),
          user_id: comment.user_id.toString(),
        })),
      },
    };
  }

  /**
   * POST /blogs/comments
   * Submit a comment for moderation.
   */
  async submitComment(
    userId: string | number | bigint,
    dto: SubmitBlogCommentDto,
  ) {
    const blogId = BigInt(dto.blog_id);

    const blog = await this.prisma.blogs.findFirst({
      where: {
        id: blogId,
        status: true,
        blog_category: {
          is: {
            status: true,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const commentText = dto.comment.trim();

    if (!commentText) {
      throw new NotFoundException('Comment cannot be empty');
    }

    const comment = await this.prisma.blog_comments.create({
      data: {
        blog_id: blogId,
        user_id: BigInt(userId),
        comment: commentText,
        status: false,
      },
    });

    return {
      status: true,
      message: 'Comment submitted successfully. Waiting for approval.',
      data: {
        id: comment.id.toString(),
        blog_id: comment.blog_id.toString(),
        user_id: comment.user_id.toString(),
        comment: comment.comment,
        status: comment.status,
        created_at: comment.created_at,
      },
    };
  }

  /**
   * Convert BigInt IDs to strings for JSON serialization.
   */
  private serializeBlog(blog: any, langCode?: string) {
    const translations = blog.blog_translations ?? [];

    const selectedTranslation =
      translations.find(
        (item: any) => item.lang_code === langCode,
      ) ??
      translations[0] ??
      null;

    const category = blog.blog_category ?? null;

    return {
      ...blog,

      id: blog.id.toString(),
      admin_id: blog.admin_id.toString(),
      blog_category_id: blog.blog_category_id.toString(),
      views: blog.views.toString(),

      translation: selectedTranslation,

      blog_translations: translations,

      blog_category: category
        ? {
            ...category,
            id: category.id.toString(),
          }
        : null,
    };
  }
}