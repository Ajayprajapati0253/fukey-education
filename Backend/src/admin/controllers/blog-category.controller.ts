import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { BlogCategoryService } from '../services/blog-category.service';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from '../dto/update-blog-category.dto';

@Controller('admin/blog-categories')
export class BlogCategoryController {
  constructor(
    private readonly blogCategoryService: BlogCategoryService,
  ) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true }))
    page = 1,

    @Query('limit', new ParseIntPipe({ optional: true }))
    limit = 15,
  ) {
    return this.blogCategoryService.findAll(
      page,
      limit,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.blogCategoryService.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateBlogCategoryDto,
  ) {
    return this.blogCategoryService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogCategoryDto,
  ) {
    return this.blogCategoryService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    return this.blogCategoryService.remove(id);
  }

  @Patch(':id/status')
  async statusUpdate(
    @Param('id') id: string,
  ) {
    return this.blogCategoryService.statusUpdate(id);
  }
}