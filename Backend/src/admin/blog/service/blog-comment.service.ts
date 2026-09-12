import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogCommentService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Laravel:
   * BlogComment::latest()->paginate(15)
   */
  async findAll(
    page: number = 1,
    limit: number = 15,
  ) {
    const skip = (page - 1) * limit;

    const [total, comments] =
      await this.prisma.$transaction([
        this.prisma.blog_comments.count(),

        this.prisma.blog_comments.findMany({
          orderBy: {
            id: 'desc',
          },
          skip,
          take: limit,
          select: {
            id: true,
            blog_id: true,
            user_id: true,
            name: true,
            email: true,
            phone: true,
            comment: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        }),
      ]);

    const lastPage =
      Math.ceil(total / limit);

    return {
      status: 'success',
      data: comments.map((comment) => ({
        ...comment,
        id: comment.id.toString(),
        blog_id: comment.blog_id.toString(),
        user_id: comment.user_id.toString(),
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
   * Laravel:
   * BlogComment::where('blog_id', $id)->paginate(20)
   */
  async findByBlog(
    blogId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const blogIdBigInt = BigInt(blogId);

    const skip = (page - 1) * limit;

    const [total, comments] =
      await this.prisma.$transaction([
        this.prisma.blog_comments.count({
          where: {
            blog_id: blogIdBigInt,
          },
        }),

        this.prisma.blog_comments.findMany({
          where: {
            blog_id: blogIdBigInt,
          },
          orderBy: {
            id: 'desc',
          },
          skip,
          take: limit,
          select: {
            id: true,
            blog_id: true,
            user_id: true,
            name: true,
            email: true,
            phone: true,
            comment: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        }),
      ]);

    const lastPage =
      Math.ceil(total / limit);

    return {
      status: 'success',
      data: comments.map((comment) => ({
        ...comment,
        id: comment.id.toString(),
        blog_id: comment.blog_id.toString(),
        user_id: comment.user_id.toString(),
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
   * Laravel:
   * BlogComment::findOrFail($id)?->delete()
   */
  async remove(id: string) {
    const commentId = BigInt(id);

    const comment =
      await this.prisma.blog_comments.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
        },
      });

    if (!comment) {
      throw new NotFoundException(
        'Blog comment not found',
      );
    }

    await this.prisma.blog_comments.delete({
      where: {
        id: commentId,
      },
    });

    return {
      success: true,
      message: 'Deleted Successfully',
    };
  }

  /**
   * Laravel:
   * statusUpdate($id)
   */
  async statusUpdate(id: string) {
    const commentId = BigInt(id);

    const comment =
      await this.prisma.blog_comments.findUnique({
        where: {
          id: commentId,
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!comment) {
      return {
        success: false,
        message: 'Failed!',
      };
    }

    const updated =
      await this.prisma.blog_comments.update({
        where: {
          id: commentId,
        },
        data: {
          status: !comment.status,
        },
        select: {
          id: true,
          status: true,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        id: updated.id.toString(),
        status: updated.status,
      },
    };
  }
}