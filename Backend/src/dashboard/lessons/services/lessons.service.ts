import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { course_progress_type } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

async getLessonInfo(
  userId: string | number,
  slug: string,
  type: string,
  lessonId: string | number,
) {
  const userIdBigInt = BigInt(userId);
  const lessonIdBigInt = BigInt(lessonId);

  const progressTypeMap: Record<string, course_progress_type> = {
    lesson: course_progress_type.lesson,
    document: course_progress_type.document,
    live: course_progress_type.live,
    quiz: course_progress_type.quiz,
  };

  const progressType = progressTypeMap[type];

  if (!progressType) {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  // 1. Verify student enrollment
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      user_id: userIdBigInt,
      has_access: true,
      courses: {
        slug,
      },
    },
    select: {
      course_id: true,
    },
  });

  if (!enrollment?.course_id) {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  let courseId: bigint;
  let chapterId: bigint;
  let data: any;

  // 2. Fetch lesson, document, or live class
  if (['lesson', 'document', 'live'].includes(type)) {
    const lesson = await this.prisma.course_chapter_lessons.findFirst({
      where: {
        id: lessonIdBigInt,
        course_id: enrollment.course_id,
      },
      select: {
        id: true,
        course_id: true,
        chapter_id: true,
        chapter_item_id: true,
        title: true,
        description: true,
        downloadable: true,
        file_path: true,
        storage: true,
        file_type: true,
        duration: true,
        is_free: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    courseId = lesson.course_id;
    chapterId = lesson.chapter_id;

    if (type === 'live') {
      const live = await this.prisma.course_live_classes.findFirst({
        where: {
          lesson_id: lesson.id,
        },
        select: {
          start_time: true,
          type: true,
          meeting_id: true,
          password: true,
          join_url: true,
        },
      });

      if (!live?.start_time) {
        throw new NotFoundException({
          status: 'error',
          message: 'Not Found!',
        });
      }

      const startTime = new Date(live.start_time);
      const durationMinutes = Number(lesson.duration ?? 0);

      const endTime = new Date(
        startTime.getTime() + durationMinutes * 60_000,
      );

      const now = new Date();

      const isLiveNow =
        now >= startTime && now <= endTime
          ? 'started'
          : now < startTime
            ? 'not_started'
            : 'ended';

      data = {
        ...lesson,
        live,
        start_time: startTime,
        end_time: endTime,
        is_live_now: isLiveNow,
      };
    } else {
      data = {
        id: lesson.id.toString(),
        course_id: lesson.course_id.toString(),
        chapter_id: lesson.chapter_id.toString(),
        chapter_item_id: lesson.chapter_item_id?.toString() ?? null,
        title: lesson.title,
        description: lesson.description,
        downloadable: lesson.downloadable,
        file_path: lesson.file_path,
        storage: lesson.storage,
        file_type: lesson.file_type,
        duration: lesson.duration,
      };
    }
  } else {
    // 3. Fetch quiz
    const quiz = await this.prisma.quizzes.findFirst({
      where: {
        id: lessonIdBigInt,
        course_id: enrollment.course_id,
      },
      select: {
        id: true,
        course_id: true,
        chapter_id: true,
        chapter_item_id: true,
        title: true,
        time: true,
        attempt: true,
        pass_mark: true,
        total_mark: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    courseId = quiz.course_id;
    chapterId = quiz.chapter_id;

    data = {
      ...quiz,
      id: quiz.id.toString(),
      course_id: quiz.course_id.toString(),
      chapter_id: quiz.chapter_id.toString(),
      chapter_item_id: quiz.chapter_item_id?.toString() ?? null,
    };
  }

  // 4. Update progress
  await this.updateCourseProgress(
    userIdBigInt,
    courseId,
    chapterId,
    lessonIdBigInt,
    progressType,
  );

  return {
    status: 'success',
    data,
  };
}

private async updateCourseProgress(
  userId: string | number | bigint,
  courseId: bigint,
  chapterId: bigint,
  lessonId: bigint,
  type: course_progress_type,
): Promise<void> {
  const userIdBigInt = BigInt(userId);

  await this.prisma.$transaction(async (tx) => {
    // Reset current progress for this student and course
    await tx.course_progress.updateMany({
      where: {
        user_id: userIdBigInt,
        course_id: courseId,
        current: true,
      },
      data: {
        current: false,
      },
    });

    // Find existing progress
    const existingProgress = await tx.course_progress.findFirst({
      where: {
        user_id: userIdBigInt,
        course_id: courseId,
        chapter_id: chapterId,
        lesson_id: lessonId,
        type,
      },
      select: {
        id: true,
      },
    });

    if (existingProgress) {
      await tx.course_progress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          current: true,
          updated_at: new Date(),
        },
      });
    } else {
      await tx.course_progress.create({
        data: {
          user_id: userIdBigInt,
          course_id: courseId,
          chapter_id: chapterId,
          lesson_id: lessonId,
          type,
          current: true,
        },
      });
    }
  });
}


async makeLessonComplete(
  userId: string | number,
  lessonId: string | number,
) {
  const progress = await this.prisma.course_progress.findFirst({
    where: {
      user_id: BigInt(userId),
      lesson_id: BigInt(lessonId),
    },
  });

  if (!progress) {
    throw new BadRequestException({
      status: 'error',
      message: 'You didnt watched this lesson',
    });
  }

  await this.prisma.course_progress.update({
    where: { id: progress.id },
    data: {
      watched: !progress.watched,
      updated_at: new Date(),
    },
  });

  return {
    status: 'success',
    message: 'Updated successfully.',
  };
}

async learningProgress(
  userId: string | number,
  slug: string,
) {
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      user_id: BigInt(userId),
      has_access: true,
      courses: {
        slug: slug,
      },
    },
    select: {
      course_id: true,
    },
  });

  if (!enrollment) {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  const courseId = enrollment.course_id;

  const totalItems = await this.prisma.course_chapter_items.count({
    where: {
      course_chapters: {
        course_id: courseId,
      },
    },
  });

  const completedItems = await this.prisma.course_progress.count({
    where: {
      user_id: BigInt(userId),
      course_id: courseId,
      watched: true,
    },
  });

  const progress =
    totalItems > 0
      ? (completedItems / totalItems) * 100
      : 0;

  return {
    status: 'success',
    data: progress,
  };
}
}