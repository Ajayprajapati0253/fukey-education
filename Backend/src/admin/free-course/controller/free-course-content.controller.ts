import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FreeCourseContentService } from '../services/free-course-content.service';

import { CreateChapterDto } from '../dto/create-chapter.dto';
import { UpdateChapterDto } from '../dto/update-chapter.dto';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';

import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';
@Controller('admin/free-course-content')
@UseGuards(AdminAuthGuard)
export class FreeCourseContentController {
  constructor(
    private readonly service: FreeCourseContentService,
  ) {}

  // =========================================================
  // CHAPTER CRUD
  // =========================================================

  /**
   * Create Chapter
   *
   * POST /admin/free-course-content/courses/:courseId/chapters
   */
  @Post('courses/:courseId/chapters')
  async createChapter(
    @Param('courseId') courseId: string,
    @Body() dto: CreateChapterDto,
  ) {
    return this.service.createChapter({
      ...dto,
      free_course_id: courseId,
    });
  }

  /**
   * Get Chapter
   *
   * GET /admin/free-course-content/chapters/:chapterId
   */
  @Get('chapters/:chapterId')
  async getChapter(
    @Param('chapterId') chapterId: string,
  ) {
    return this.service.getChapter(chapterId);
  }

  /**
   * Update Chapter
   *
   * PATCH /admin/free-course-content/chapters/:chapterId
   */
  @Patch('chapters/:chapterId')
  async updateChapter(
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.service.updateChapter(
      chapterId,
      dto,
    );
  }

  /**
   * Delete Chapter
   *
   * DELETE /admin/free-course-content/chapters/:chapterId
   */
  @Delete('chapters/:chapterId')
  async deleteChapter(
    @Param('chapterId') chapterId: string,
  ) {
    return this.service.deleteChapter(
      chapterId,
    );
  }

  // =========================================================
  // CHAPTER SORTING
  // =========================================================

  /**
   * Get Chapter Sorting
   *
   * GET /admin/free-course-content/courses/:courseId/chapters/sorting
   */
  @Get('courses/:courseId/chapters/sorting')
  async getChapterSorting(
    @Param('courseId') courseId: string,
  ) {
    return this.service.getChapterSorting(
      courseId,
    );
  }

  /**
   * Save Chapter Sorting
   *
   * PATCH /admin/free-course-content/courses/:courseId/chapters/sorting
   *
   * Body:
   * {
   *   "chapter_ids": ["3", "1", "2"]
   * }
   */
  @Patch('courses/:courseId/chapters/sorting')
  async sortChapters(
    @Param('courseId') courseId: string,
    @Body('chapter_ids') chapterIds: string[],
  ) {
    return this.service.sortChapters(
      courseId,
      chapterIds,
    );
  }

  // =========================================================
  // LESSON / DOCUMENT
  // =========================================================

  /**
   * Create Lesson / Document
   *
   * POST /admin/free-course-content/lessons
   */
  @Post('lessons')
  async createLesson(
    @Body() dto: CreateLessonDto,
  ) {
    return this.service.createLesson(dto);
  }

  /**
   * Get Lesson
   *
   * GET /admin/free-course-content/lessons/:chapterItemId
   */
  @Get('lessons/:chapterItemId')
  async getLesson(
    @Param('chapterItemId') chapterItemId: string,
  ) {
    return this.service.getLesson(
      chapterItemId,
    );
  }

  /**
   * Update Lesson / Document
   *
   * PATCH /admin/free-course-content/lessons
   */
  @Patch('lessons')
  async updateLesson(
    @Body() dto: UpdateLessonDto,
  ) {
    return this.service.updateLesson(dto);
  }

  /**
   * Delete Lesson / Document
   *
   * DELETE /admin/free-course-content/lessons/:chapterItemId
   */
  @Delete('lessons/:chapterItemId')
  async deleteLesson(
    @Param('chapterItemId') chapterItemId: string,
  ) {
    return this.service.deleteLesson(
      chapterItemId,
    );
  }

  // =========================================================
  // LESSON SORTING
  // =========================================================

  /**
   * Save Lesson Sorting
   *
   * PATCH /admin/free-course-content/chapters/:chapterId/lessons/sorting
   *
   * Body:
   * {
   *   "orderIds": ["5", "2", "7"]
   * }
   */
  @Patch(
    'chapters/:chapterId/lessons/sorting',
  )
  async sortLessons(
    @Param('chapterId') chapterId: string,
    @Body('orderIds') orderIds: string[],
  ) {
    return this.service.sortLessons(
      chapterId,
      orderIds,
    );
  }

  // =========================================================
  // LEGACY / UI SUPPORT
  // =========================================================

  /**
   * Lesson Create Options
   *
   * Laravel lessonCreate() used:
   * courseId, chapterId and type to render modal.
   *
   * In NestJS API we don't render Blade HTML.
   * This endpoint returns the available information.
   *
   * GET /admin/free-course-content/lesson-options
   */
  @Get('lesson-options')
  async lessonOptions(
    @Query('courseId') courseId: string,
    @Query('chapterId') chapterId: string,
    @Query('type') type: string,
  ) {
    if (type === 'quiz') {
      return {
        status: 'error',
        message:
          'Quiz support is not available yet.',
      };
    }

    if (!['lesson', 'document'].includes(type)) {
      return {
        status: 'error',
        message: 'Invalid content type.',
      };
    }

    return {
      status: 'success',
      course_id: courseId,
      chapter_id: chapterId,
      type,
    };
  }

  /**
   * Lesson Edit Options
   *
   * Laravel lessonEdit() returned Blade modal.
   * NestJS returns the lesson data through getLesson().
   */
  @Get('lesson-options/:chapterItemId')
  async lessonEditOptions(
    @Param('chapterItemId') chapterItemId: string,
    @Query('type') type: string,
  ) {
    if (type === 'quiz') {
      return {
        status: 'error',
        message:
          'Quiz support is not available yet.',
      };
    }

    return this.service.getLesson(
      chapterItemId,
    );
  }
}