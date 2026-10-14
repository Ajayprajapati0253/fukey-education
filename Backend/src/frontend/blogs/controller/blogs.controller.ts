import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { BlogsService } from '../services/blogs.service';
import { GetBlogsDto } from '../dto/get-blogs.dto';
import { SubmitBlogCommentDto } from '../dto/submit-blog-comment.dto';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
  ) {}

  /**
   * GET /blogs
   * Public blog listing with search and filters.
   */
  @Get()
  findAll(@Query() query: GetBlogsDto) {
    return this.blogsService.findAll(query);
  }

  /**
   * GET /blogs/:slug
   * Public blog details.
   */
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('blog_lang') blogLang?: string,
  ) {
    return this.blogsService.findBySlug(
      slug,
      blogLang,
    );
  }

  /**
   * POST /blogs/comments
   * Authenticated user submits a comment for approval.
   */
  @Post('comments')
  @UseGuards(JwtAuthGuard)
  submitComment(
    @Req() req: any,
    @Body() dto: SubmitBlogCommentDto,
  ) {
    const userId = req.user?.id ?? req.user?.userId;

    if (userId === undefined || userId === null) {
      throw new UnauthorizedException(
        'Authenticated user ID is missing.',
      );
    }

    return this.blogsService.submitComment(
      userId,
      dto,
    );
  }
}