import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { EbookService } from '../services/ebook.service';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { UpdateEbookDto } from '../dto/update-ebook.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/ebooks')
@UseGuards(AdminAuthGuard)
export class EbookController {
  constructor(private readonly ebookService: EbookService) {}

  /**
   * GET /admin/ebooks
   */
  @Get()
  async index(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = page ? Number(page) : 1;
    const perPage = limit ? Number(limit) : 20;

    return this.ebookService.findAll(
      currentPage,
      perPage,
    );
  }

  /**
   * GET /admin/ebooks/:id
   */
  @Get(':id')
  async show(@Param('id') id: string) {
    return this.ebookService.findOne(id);
  }

  /**
   * GET /admin/ebooks/category/:id/courses
   *
   * Laravel:
   * getCoursesByCategory($id)
   *
   * NOTE:
   * Service method will be added after confirming
   * CourseSelectedLanguage Prisma relation.
   */
  @Get('category/:id/courses')
  async getCoursesByCategory(
    @Param('id') id: string,
  ) {
    return this.ebookService.getCoursesByCategory(id);
  }

  /**
   * POST /admin/ebooks
   */
  @Post()
  async store(@Body() dto: CreateEbookDto) {
    return this.ebookService.create(dto);
  }

  /**
   * PUT /admin/ebooks/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEbookDto,
  ) {
    return this.ebookService.update(id, dto);
  }

  /**
   * DELETE /admin/ebooks/:id
   */
  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return this.ebookService.remove(id);
  }
}