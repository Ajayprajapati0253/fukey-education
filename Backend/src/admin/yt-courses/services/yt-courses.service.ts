import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateYtCourseDto } from '../dto/create-yt-course.dto';
import { UpdateYtCourseDto } from '../dto/update-yt-course.dto';

@Injectable()
export class YtCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateYtCourseDto) {
    try {
      const course = await this.prisma.yt_courses.create({
        data: {
          title: dto.title,
          description: dto.description,
          youtube_video_id: dto.youtube_video_id,
          thumbnail: dto.thumbnail,
          is_active: dto.is_active,
          sort_order: dto.sort_order,
        },
      });

      return {
        status: true,
        message: 'YT course created successfully',
        data: {
          ...course,
          id: course.id.toString(),
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateYtCourseDto) {
    const courseId = this.parseId(id);

    try {
      const course = await this.prisma.yt_courses.update({
        where: { id: courseId },
        data: dto,
      });

      return {
        status: true,
        message: 'YT course updated successfully',
        data: {
          ...course,
          id: course.id.toString(),
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    const courseId = this.parseId(id);

    try {
      await this.prisma.yt_courses.delete({
        where: { id: courseId },
      });

      return {
        status: true,
        message: 'YT course deleted successfully',
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new NotFoundException('YT course not found');
    }

    return BigInt(id);
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'This YouTube video ID already exists',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('YT course not found');
    }

    throw error;
  }
}