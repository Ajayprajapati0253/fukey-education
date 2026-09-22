import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChapterDto } from '../dto/create-chapter.dto';
import { UpdateChapterDto } from '../dto/update-chapter.dto';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  free_course_chapter_items_type,
  free_course_chapter_lessons_file_type,
  free_course_chapter_lessons_storage,
} from '@prisma/client';

@Injectable()
export class FreeCourseContentService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CHAPTER CRUD
  // =========================================================

  async createChapter(dto: CreateChapterDto) {
    const courseId = BigInt(dto.free_course_id);

    const course = await this.prisma.free_courses.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Free course not found.');
    }

    // Laravel:
    // max('order') + 1
    const maxOrder = await this.prisma.free_course_chapters.aggregate({
      where: {
        free_course_id: courseId,
      },
      _max: {
        order: true,
      },
    });

    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const chapter = await this.prisma.free_course_chapters.create({
      data: {
        title: dto.title,
        free_course_id: courseId,
        instructor_id: course.instructor_id,
        status: 'active',
        order: nextOrder,
      },
    });

    return {
      success: true,
      message: 'Chapter created successfully',
      data: this.serialize(chapter),
    };
  }

  async getChapter(chapterId: string) {
    const id = BigInt(chapterId);

    const chapter = await this.prisma.free_course_chapters.findUnique({
      where: {
        id,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found.');
    }

    return {
      data: this.serialize(chapter),
    };
  }

  async updateChapter(
    chapterId: string,
    dto: UpdateChapterDto,
  ) {
    const id = BigInt(chapterId);

    const chapter = await this.prisma.free_course_chapters.findUnique({
      where: {
        id,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found.');
    }

    const updated = await this.prisma.free_course_chapters.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
      },
    });

    return {
      success: true,
      message: 'Updated successfully',
      data: this.serialize(updated),
    };
  }

  async deleteChapter(chapterId: string) {
    const id = BigInt(chapterId);

    const chapter = await this.prisma.free_course_chapters.findUnique({
      where: {
        id,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found.');
    }

    const items = await this.prisma.free_course_chapter_items.findMany({
      where: {
        chapter_id: id,
      },
    });

    const itemIds = items.map((item) => item.id);

    // Laravel first gets lesson files belonging
    // to all chapter items.
    if (itemIds.length > 0) {
      await this.prisma.free_course_chapter_lessons.deleteMany({
        where: {
          chapter_item_id: {
            in: itemIds,
          },
        },
      });

      await this.prisma.free_course_chapter_items.deleteMany({
        where: {
          id: {
            in: itemIds,
          },
        },
      });
    }

    await this.prisma.free_course_chapters.delete({
      where: {
        id,
      },
    });

    return {
      status: 'success',
      message: 'Chapter deleted successfully',
    };
  }

  // =========================================================
  // CHAPTER SORTING
  // =========================================================

  async getChapterSorting(courseId: string) {
    const id = BigInt(courseId);

    const chapters = await this.prisma.free_course_chapters.findMany({
      where: {
        free_course_id: id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return {
      data: chapters.map((chapter) => this.serialize(chapter)),
    };
  }

  async sortChapters(
    courseId: string,
    chapterIds: string[],
  ) {
    const id = BigInt(courseId);

    for (let index = 0; index < chapterIds.length; index++) {
      const chapterId = BigInt(chapterIds[index]);

      const chapter =
        await this.prisma.free_course_chapters.findFirst({
          where: {
            id: chapterId,
            free_course_id: id,
          },
        });

      if (!chapter) {
        throw new BadRequestException(
          `Chapter ${chapterIds[index]} does not belong to this course.`,
        );
      }

      await this.prisma.free_course_chapters.update({
        where: {
          id: chapterId,
        },
        data: {
          order: index + 1,
        },
      });
    }

    return {
      success: true,
      message: 'Updated successfully',
    };
  }

  // =========================================================
  // LESSON / DOCUMENT CREATE
  // =========================================================

  async createLesson(dto: CreateLessonDto) {
    if (dto.type === 'quiz') {
      throw new BadRequestException(
        'Quiz support is not available yet.',
      );
    }

    if (!['lesson', 'document'].includes(dto.type)) {
      throw new BadRequestException(
        'Invalid content type.',
      );
    }

    const courseId = BigInt(dto.free_course_id);
    const chapterId = BigInt(dto.chapter_id);

    const course = await this.prisma.free_courses.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Free course not found.',
      );
    }

    const chapter =
      await this.prisma.free_course_chapters.findUnique({
        where: {
          id: chapterId,
        },
      });

    if (!chapter) {
      throw new NotFoundException(
        'Chapter not found.',
      );
    }

    if (chapter.free_course_id !== courseId) {
      throw new BadRequestException(
        'Chapter does not belong to this course.',
      );
    }

    await this.validateLessonData(dto);

    // Laravel:
    // count() + 1
    const itemCount =
      await this.prisma.free_course_chapter_items.count({
        where: {
          chapter_id: chapterId,
        },
      });

    const order = itemCount + 1;

    const chapterItem =
      await this.prisma.free_course_chapter_items.create({
        data: {
          instructor_id: course.instructor_id,
          chapter_id: chapterId,
          type: dto.type as free_course_chapter_items_type,
          order,
        },
      });

    if (dto.type === 'lesson') {
      await this.prisma.free_course_chapter_lessons.create({
        data: {
          title: dto.title,
          description: dto.description ?? null,
          instructor_id: chapterItem.instructor_id,
          free_course_id: courseId,
          chapter_id: chapterId,
          chapter_item_id: chapterItem.id,
          file_path:
            dto.source === 'upload'
              ? dto.upload_path ?? null
              : dto.link_path ?? null,
          storage: dto.source as free_course_chapter_lessons_storage,
          file_type:dto.file_type as free_course_chapter_lessons_file_type,
          volume: dto.volume ?? null,
          duration: dto.duration,
          is_free:
            dto.is_free ?? false,
        },
      });
    }

    if (dto.type === 'document') {
      await this.prisma.free_course_chapter_lessons.create({
        data: {
          title: dto.title,
          description: dto.description ?? null,
          instructor_id: chapterItem.instructor_id,
          free_course_id: courseId,
          chapter_id: chapterId,
          chapter_item_id: chapterItem.id,
          file_path: dto.upload_path ?? null,
          file_type: dto.file_type as free_course_chapter_lessons_file_type,
        },
      });
    }

    return {
      status: 'success',
      message: 'Lesson created successfully',
    };
  }

  // =========================================================
  // LESSON / DOCUMENT UPDATE
  // =========================================================

  async updateLesson(dto: UpdateLessonDto) {
    if (dto.type === 'quiz') {
      throw new BadRequestException(
        'Quiz support is not available yet.',
      );
    }

    if (!['lesson', 'document'].includes(dto.type)) {
      throw new BadRequestException(
        'Invalid content type.',
      );
    }

    const itemId = BigInt(dto.chapter_item_id);
    const chapterId = BigInt(dto.chapter);
    const courseId = BigInt(dto.free_course_id);

    const chapterItem =
      await this.prisma.free_course_chapter_items.findUnique({
        where: {
          id: itemId,
        },
      });

    if (!chapterItem) {
      throw new NotFoundException(
        'Chapter item not found.',
      );
    }

    await this.validateUpdateLessonData(dto);

    // Laravel:
    // $chapterItem->update([
    //     'chapter_id' => $request->chapter
    // ]);
    await this.prisma.free_course_chapter_items.update({
      where: {
        id: itemId,
      },
      data: {
        chapter_id: chapterId,
      },
    });

    const lesson =
      await this.prisma.free_course_chapter_lessons.findFirst({
        where: {
          chapter_item_id: itemId,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        'Lesson not found.',
      );
    }

    if (dto.type === 'lesson') {
      await this.prisma.free_course_chapter_lessons.update({
        where: {
          id: lesson.id,
        },
        data: {
          title: dto.title,
          description: dto.description ?? null,
          free_course_id: courseId,
          chapter_id: chapterId,
          chapter_item_id: itemId,
          file_path:
            dto.source === 'upload'
              ? dto.upload_path ?? null
              : dto.link_path ?? null,
          storage: dto.source as free_course_chapter_lessons_storage,
          file_type: dto.file_type as free_course_chapter_lessons_file_type,
          volume: dto.volume ?? null,
          duration: dto.duration ?? null,
        },
      });
    }

    if (dto.type === 'document') {
      await this.prisma.free_course_chapter_lessons.update({
        where: {
          id: lesson.id,
        },
        data: {
          title: dto.title,
          description: dto.description ?? null,
          free_course_id: courseId,
          chapter_id: chapterId,
          chapter_item_id: itemId,
          file_path: dto.upload_path ?? null,
          file_type: dto.file_type as free_course_chapter_lessons_file_type,
        },
      });
    }

    return {
      status: 'success',
      message: 'Lesson updated successfully',
    };
  }

  // =========================================================
  // LESSON SORTING
  // =========================================================

  async sortLessons(
    chapterId: string,
    orderIds: string[],
  ) {
    const id = BigInt(chapterId);

    for (let index = 0; index < orderIds.length; index++) {
      const itemId = BigInt(orderIds[index]);

      const item =
        await this.prisma.free_course_chapter_items.findFirst({
          where: {
            id: itemId,
            chapter_id: id,
          },
        });

      if (!item) {
        throw new BadRequestException(
          `Lesson ${orderIds[index]} does not belong to this chapter.`,
        );
      }

      await this.prisma.free_course_chapter_items.update({
        where: {
          id: itemId,
        },
        data: {
          order: index + 1,
        },
      });
    }

    return {
      status: 'success',
      message: 'Lesson sorted successfully',
    };
  }

  // =========================================================
  // LESSON DELETE
  // =========================================================

  async deleteLesson(chapterItemId: string) {
    const itemId = BigInt(chapterItemId);

    const chapterItem =
      await this.prisma.free_course_chapter_items.findUnique({
        where: {
          id: itemId,
        },
      });

    if (!chapterItem) {
      throw new NotFoundException(
        'Chapter item not found.',
      );
    }

    if (chapterItem.type === 'quiz') {
      throw new BadRequestException(
        'Quiz support is not available yet.',
      );
    }

    const lesson =
      await this.prisma.free_course_chapter_lessons.findFirst({
        where: {
          chapter_item_id: itemId,
        },
      });

    if (lesson) {
      await this.prisma.free_course_chapter_lessons.delete({
        where: {
          id: lesson.id,
        },
      });
    }

    await this.prisma.free_course_chapter_items.delete({
      where: {
        id: itemId,
      },
    });

    return {
      status: 'success',
      message: 'Lesson deleted successfully',
    };
  }

  // =========================================================
  // GET LESSON
  // =========================================================

  async getLesson(chapterItemId: string) {
    const itemId = BigInt(chapterItemId);

    const item =
      await this.prisma.free_course_chapter_items.findUnique({
        where: {
          id: itemId,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Chapter item not found.',
      );
    }

    const lesson =
      await this.prisma.free_course_chapter_lessons.findFirst({
        where: {
          chapter_item_id: itemId,
        },
      });

    return {
      chapter_item: this.serialize(item),
      lesson: this.serialize(lesson),
    };
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  private async validateLessonData(
    dto: CreateLessonDto,
  ) {
    if (!dto.title) {
      throw new BadRequestException(
        'The title field is required.',
      );
    }

    if (!dto.source) {
      throw new BadRequestException(
        'The source field is required.',
      );
    }

    if (!dto.file_type) {
      throw new BadRequestException(
        'The file type field is required.',
      );
    }

    if (!dto.duration) {
      throw new BadRequestException(
        'The duration field is required.',
      );
    }

    if (dto.type === 'lesson') {
      if (dto.source === 'upload' && !dto.upload_path) {
        throw new BadRequestException(
          'The upload path field is required.',
        );
      }

      if (dto.source !== 'upload' && !dto.link_path) {
        throw new BadRequestException(
          'The link path field is required.',
        );
      }
    }

    if (dto.type === 'document') {
      if (!['txt', 'pdf', 'docx'].includes(dto.file_type)) {
        throw new BadRequestException(
          'Invalid document file type.',
        );
      }

      if (!dto.upload_path) {
        throw new BadRequestException(
          'The upload path field is required.',
        );
      }

      const extension = dto.upload_path
        .split('.')
        .pop()
        ?.toLowerCase();

      if (extension !== dto.file_type.toLowerCase()) {
        throw new BadRequestException(
          'The upload file extension does not match the required file type.',
        );
      }
    }
  }

  private async validateUpdateLessonData(
    dto: UpdateLessonDto,
  ) {
    if (!dto.title) {
      throw new BadRequestException(
        'The title field is required.',
      );
    }

    if (!dto.file_type) {
      throw new BadRequestException(
        'The file type field is required.',
      );
    }

    if (dto.type === 'lesson') {
      if (!dto.source) {
        throw new BadRequestException(
          'The source field is required.',
        );
      }

      if (dto.source === 'upload' && !dto.upload_path) {
        throw new BadRequestException(
          'The upload path field is required.',
        );
      }

      if (dto.source !== 'upload' && !dto.link_path) {
        throw new BadRequestException(
          'The link path field is required.',
        );
      }
    }

    if (dto.type === 'document') {
      if (!['txt', 'pdf', 'docx'].includes(dto.file_type)) {
        throw new BadRequestException(
          'Invalid document file type.',
        );
      }

      if (!dto.upload_path) {
        throw new BadRequestException(
          'The upload path field is required.',
        );
      }
    }
  }

  // =========================================================
  // BIGINT SERIALIZER
  // =========================================================

  private serialize(value: any) {
    if (value === null || value === undefined) {
      return value;
    }

    return JSON.parse(
      JSON.stringify(value, (_, currentValue) =>
        typeof currentValue === 'bigint'
          ? currentValue.toString()
          : currentValue,
      ),
    );
  }
}