import {
    Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
import { BlogsService } from '../service/blogs.service';
import { CreateBlogDto } from 'src/admin/blog/dto/create-blog.dto';
import { UpdateBlogDto } from 'src/admin/blog/dto/update-blog.dto';


@Controller('admin/blogs')
@UseGuards(AdminAuthGuard)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async getBlogs(@Query() query: any) {
    const result = await this.blogsService.getBlogs(query);

    return {
      status: 'success',
      ...result,
    };
  }

  @Post('create')
 async createBlog( @Body() body: CreateBlogDto,@Req() req: any,) {
    const adminId = BigInt(req.admin.sub);


    const blog = await this.blogsService.createBlog(
      body,
      adminId,
    );

    return {
      status: 'success',
      message: 'Blog created successfully',
      data: blog,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogsService.update(
      id,
      dto,
    );
  }

  @Get(':id')
async findOne(
  @Param('id') id: string,
) {
  return this.blogsService.findOne(id);
}

  /**
   * Delete blog
   *
   * DELETE
   * /admin/blogs/:id
   **/
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.blogsService.remove(id);
  }

}