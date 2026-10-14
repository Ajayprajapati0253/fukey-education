
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';

@Injectable()
export class QnaService {
  constructor(private readonly prisma: PrismaService) {}

  private notFound(): never {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  private id(value: string | number | bigint): bigint {
    try {
      return BigInt(value);
    } catch {
      this.notFound();
    }
  }

  private async getEnrolledCourse(
    userId: string | number | bigint,
    courseSlug: string,
  ) {
    const course = await this.prisma.courses.findFirst({
      where: {
        slug: courseSlug,
        enrollments: {
          some: {
            user_id: this.id(userId),
            has_access: true,
          },
        },
      },
      select: { id: true },
    });

    if (!course) this.notFound();
    return course;
  }

  private async validateLesson(courseId: bigint, lessonId: bigint) {
    const lesson = await this.prisma.course_chapter_lessons.findFirst({
      where: {
        id: lessonId,
        course_id: courseId,
      },
      select: { id: true },
    });

    if (!lesson) this.notFound();
    return lesson;
  }

  async fetchLessonQuestions(
    userId: string | number | bigint,
    courseSlug: string,
    lessonId: number,
    query: { limit?: string; page?: string; search?: string },
    requestUrl = '',
  ) {
    const userBigInt = this.id(userId);
    const lessonBigInt = this.id(lessonId);

    const course = await this.prisma.courses.findFirst({
      where: { slug: courseSlug },
      select: { id: true },
    });

    if (!course) this.notFound();

    // Match Laravel: only the authenticated user's questions.
    const enrolled = await this.prisma.enrollments.findFirst({
      where: {
        user_id: userBigInt,
        course_id: course.id,
        has_access: true,
      },
      select: { id: true },
    });

    if (!enrolled) this.notFound();

    await this.validateLesson(course.id, lessonBigInt);

    const parsedLimit = Number(query.limit);
    const parsedPage = Number(query.page);

    const limit =
      query.limit && Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 6;

    const page =
      query.page && Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1;

    const search = query.search?.trim();

    const where: any = {
      user_id: userBigInt,
      lesson_id: lessonBigInt,
      course_id: course.id,
      ...(search
        ? {
            OR: [
              { question_title: { contains: search } },
              { question_description: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, questions] = await this.prisma.$transaction([
      this.prisma.lesson_questions.count({ where }),
      this.prisma.lesson_questions.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lesson_replies: {
            orderBy: { id: 'asc' },
          },
        },
      }),
    ]);

    if (questions.length === 0) this.notFound();

    const userIds = new Set<string>();

    for (const question of questions) {
      userIds.add(question.user_id.toString());

      for (const reply of question.lesson_replies) {
        userIds.add(reply.user_id.toString());
      }
    }

    const users = await this.prisma.users.findMany({
      where: {
        id: { in: [...userIds].map((id) => BigInt(id)) },
      },
      select: { id: true, name: true, image: true },
    });

    const userMap = new Map(
      users.map((user) => [
        user.id.toString(),
        {
          id: user.id.toString(),
          name: user.name,
          image: user.image,
        },
      ]),
    );

    const data = questions.map((question) => ({
      id: question.id.toString(),
      user_id: question.user_id.toString(),
      lesson_id: question.lesson_id.toString(),
      course_id: question.course_id.toString(),
      question_title: question.question_title,
      question_description: question.question_description,
      seen: question.seen,
      created_at: question.created_at,
      updated_at: question.updated_at,
      user: userMap.get(question.user_id.toString()) ?? null,
      replies_count: question.lesson_replies.length,
      replies: question.lesson_replies.map((reply) => ({
        id: reply.id.toString(),
        user_id: reply.user_id.toString(),
        question_id: reply.question_id.toString(),
        reply: reply.reply,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        user: userMap.get(reply.user_id.toString()) ?? null,
      })),
    }));

    const lastPage = Math.max(1, Math.ceil(total / limit));

    // Build pagination URLs using the current request URL.
    const makePageUrl = (pageNumber: number | null) => {
      if (pageNumber === null || !requestUrl) return null;

      const url = new URL(requestUrl);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('page', String(pageNumber));

      if (search) {
        url.searchParams.set('search', search);
      } else {
        url.searchParams.delete('search');
      }

      return url.toString();
    };

    return {
      status: 'success',
      data,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: lastPage,
        links: {
          first: makePageUrl(1),
          prev: makePageUrl(page > 1 ? page - 1 : null),
          next: makePageUrl(page < lastPage ? page + 1 : null),
          last: makePageUrl(lastPage),
        },
      },
    };
  }

  async createLessonQuestion(
    userId: string | number | bigint,
    courseSlug: string,
    lessonId: number,
    dto: CreateQuestionDto,
  ) {
    const course = await this.getEnrolledCourse(userId, courseSlug);
    await this.validateLesson(course.id, this.id(lessonId));

    if (!dto.question?.trim() || dto.question.length > 255) {
      throw new UnprocessableEntityException({
        status: 'error',
        message: {
          question: [
            !dto.question?.trim()
              ? 'Question is required'
              : 'Question may not be greater than 255 characters',
          ],
        },
      });
    }

    if (!dto.description?.trim()) {
      throw new UnprocessableEntityException({
        status: 'error',
        message: { description: ['Description is required'] },
      });
    }

    const question = await this.prisma.lesson_questions.create({
      data: {
        user_id: this.id(userId),
        lesson_id: this.id(lessonId),
        course_id: course.id,
        question_title: dto.question,
        question_description: dto.description,
      },
    });

    return {
      status: 'success',
      message: 'Question created successfully',
      data: {
        ...question,
        id: question.id.toString(),
        user_id: question.user_id.toString(),
        lesson_id: question.lesson_id.toString(),
        course_id: question.course_id.toString(),
      },
    };
  }

  async destroyQuestion(
    userId: string | number | bigint,
    questionId: number,
  ) {
    const question = await this.prisma.lesson_questions.findFirst({
      where: {
        id: this.id(questionId),
        user_id: this.id(userId),
      },
      select: { id: true },
    });

    if (!question) this.notFound();

    // Laravel deletes replies before deleting their parent question.
    await this.prisma.$transaction([
      this.prisma.lesson_replies.deleteMany({
        where: { question_id: question.id },
      }),
      this.prisma.lesson_questions.delete({
        where: { id: question.id },
      }),
    ]);

    return {
      status: 'success',
      message: 'Question deleted successfully',
    };
  }

  async createReply(
    userId: string | number | bigint,
    lessonId: number,
    questionId: number,
    dto: CreateReplyDto,
  ) {
    const question = await this.prisma.lesson_questions.findFirst({
      where: {
        id: this.id(questionId),
        lesson_id: this.id(lessonId),
        user_id: this.id(userId),
      },
      select: { id: true },
    });

    if (!question) this.notFound();

    if (!dto.reply?.trim()) {
      throw new UnprocessableEntityException({
        status: 'error',
        message: { reply: ['Replay is required'] },
      });
    }

    const reply = await this.prisma.lesson_replies.create({
      data: {
        user_id: this.id(userId),
        question_id: question.id,
        reply: dto.reply,
      },
    });

    return {
      status: 'success',
      data: {
        ...reply,
        id: reply.id.toString(),
        user_id: reply.user_id.toString(),
        question_id: reply.question_id.toString(),
      },
      message: 'Reply created successfully',
    };
  }

  async destroyReply(
    userId: string | number | bigint,
    replyId: number,
  ) {
    const reply = await this.prisma.lesson_replies.findFirst({
      where: {
        id: this.id(replyId),
        user_id: this.id(userId),
      },
      select: { id: true },
    });

    if (!reply) this.notFound();

    await this.prisma.lesson_replies.delete({
      where: { id: reply.id },
    });

    return {
      status: 'success',
      message: 'Reply deleted successfully',
    };
  }
}
