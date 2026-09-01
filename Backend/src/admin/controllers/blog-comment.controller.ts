import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BlogCommentService } from '../services/blog-comment.service';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/blog-comments')
@UseGuards(AdminAuthGuard)
export class BlogCommentController {
  constructor(
    private readonly blogCommentService: BlogCommentService,
  ) {}

  /**
   * GET /admin/blog-comments
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogCommentService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 15,
    );
  }

  /**
   * GET /admin/blog-comments/blog/:blogId
   */
  @Get('blog/:blogId')
  async findByBlog(
    @Param('blogId') blogId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogCommentService.findByBlog(
      blogId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  /**
   * PATCH /admin/blog-comments/:id/status
   */
  @Patch(':id/status')
  async statusUpdate(
    @Param('id') id: string,
  ) {
    return this.blogCommentService.statusUpdate(id);
  }

  /**
   * DELETE /admin/blog-comments/:id
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.blogCommentService.remove(id);
  }
}