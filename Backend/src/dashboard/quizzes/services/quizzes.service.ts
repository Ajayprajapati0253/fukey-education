import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}


async quizIndex(
  userId: string | number,
  slug: string,
  quizId: number,
) {
  const userIdBigInt = BigInt(userId);

  // 1. Find course
  const course = await this.prisma.courses.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 2. Check student enrollment
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      user_id: userIdBigInt,
      course_id: course.id,
      has_access: true,
    },
  });

  if (!enrollment) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 3. Find quiz
  const quiz = await this.prisma.quizzes.findFirst({
    where: {
      id: BigInt(quizId),
      course_id: course.id,
    },
  });

  if (!quiz) {
    throw new NotFoundException({
      status: 'error',
      message: 'Quiz not found',
    });
  }

  // 4. Fetch quiz questions
  const questions = await this.prisma.quiz_questions.findMany({
    where: {
      quiz_id: quiz.id,
    },
    select: {
      id: true,
      quiz_id: true,
      title: true,
      type: true,
      grade: true,
    },
  });

  // 5. Fetch answer options without exposing correct flags
  const questionIds = questions.map((question) => question.id);

  const answers = questionIds.length
    ? await this.prisma.quiz_question_answers.findMany({
        where: {
          question_id: {
            in: questionIds,
          },
        },
        select: {
          id: true,
          question_id: true,
          title: true,
        },
      })
    : [];

  const questionsWithAnswers = questions.map((question) => ({
    id: question.id.toString(),
    quiz_id: question.quiz_id.toString(),
    title: question.title,
    type: question.type,
    grade: question.grade,
    answers: answers
      .filter((answer) => answer.question_id === question.id)
      .map((answer) => ({
        id: answer.id.toString(),
        question_id: answer.question_id.toString(),
        title: answer.title,
      })),
  }));

  // 6. Count student's previous attempts
  const attemptCount = await this.prisma.quiz_results.count({
    where: {
      user_id: userIdBigInt,
      quiz_id: quiz.id,
    },
  });

  const maxAttempts =
    quiz.attempt == null || quiz.attempt.trim() === ''
      ? null
      : Number(quiz.attempt);

  if (
    maxAttempts !== null &&
    Number.isFinite(maxAttempts) &&
    maxAttempts > 0 &&
    attemptCount >= maxAttempts
  ) {
    throw new BadRequestException({
      status: 'error',
      message: 'You reached maximum attempt',
    });
  }

  // 7. Return response
  return {
    status: 'success',
    data: {
      quiz: {
        ...quiz,
        id: quiz.id.toString(),
        chapter_item_id: quiz.chapter_item_id.toString(),
        instructor_id: quiz.instructor_id.toString(),
        chapter_id: quiz.chapter_id.toString(),
        course_id: quiz.course_id.toString(),
        questions: questionsWithAnswers,
      },
      attempt: attemptCount,
    },
  };
}

async quizStore(
  userId: string | number,
  slug: string,
  quizId: number,
  answersInput: Array<{ question_id: number; answer_id: number }>,
) {
  const userIdBigInt = BigInt(userId);

  // 1. Validate submitted answers
  if (!Array.isArray(answersInput)) {
    throw new BadRequestException({
      status: 'error',
      message: 'Answers must be an array',
    });
  }

  // 2. Find course
  const course = await this.prisma.courses.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 3. Verify enrollment
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      user_id: userIdBigInt,
      course_id: course.id,
      has_access: true,
    },
  });

  if (!enrollment) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 4. Find quiz
  const quiz = await this.prisma.quizzes.findFirst({
    where: {
      id: BigInt(quizId),
      course_id: course.id,
    },
  });

  if (!quiz) {
    throw new NotFoundException({
      status: 'error',
      message: 'Quiz not found',
    });
  }

  // 5. Enforce maximum attempts
  const attemptCount = await this.prisma.quiz_results.count({
    where: {
      user_id: userIdBigInt,
      quiz_id: quiz.id,
    },
  });

  const maxAttempts =
    quiz.attempt == null || quiz.attempt.trim() === ''
      ? null
      : Number(quiz.attempt);

  if (
    maxAttempts !== null &&
    Number.isFinite(maxAttempts) &&
    maxAttempts > 0 &&
    attemptCount >= maxAttempts
  ) {
    throw new BadRequestException({
      status: 'error',
      message: 'You reached maximum attempt',
    });
  }

  // 6. Load questions belonging to this quiz
  const questions = await this.prisma.quiz_questions.findMany({
    where: {
      quiz_id: quiz.id,
    },
    select: {
      id: true,
      grade: true,
    },
  });

  const questionMap = new Map(
    questions.map((question) => [
      question.id.toString(),
      question,
    ]),
  );

  // Prevent duplicate question IDs in a submission
  const submittedQuestionIds = new Set<string>();

  for (const item of answersInput) {
    if (
      !Number.isSafeInteger(item.question_id) ||
      !Number.isSafeInteger(item.answer_id) ||
      item.question_id <= 0 ||
      item.answer_id <= 0
    ) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid question or answer ID',
      });
    }

    const questionKey = String(item.question_id);

    if (submittedQuestionIds.has(questionKey)) {
      throw new BadRequestException({
        status: 'error',
        message: 'Duplicate question submitted',
      });
    }

    submittedQuestionIds.add(questionKey);

    if (!questionMap.has(questionKey)) {
      throw new BadRequestException({
        status: 'error',
        message: 'Question does not belong to this quiz',
      });
    }
  }

  // 7. Load submitted answer options from database
  const submittedAnswerIds = [
    ...new Set(answersInput.map((item) => BigInt(item.answer_id))),
  ];

  const answerOptions = submittedAnswerIds.length
    ? await this.prisma.quiz_question_answers.findMany({
        where: {
          id: { in: submittedAnswerIds },
        },
        select: {
          id: true,
          question_id: true,
          correct: true,
        },
      })
    : [];

  const answerMap = new Map(
    answerOptions.map((answer) => [
      answer.id.toString(),
      answer,
    ]),
  );

  // 8. Validate that each selected answer belongs to its question
  let userGrade = 0;

  const resultData: Record<
    string,
    { answer: number; correct: boolean }
  > = {};

  for (const item of answersInput) {
    const question = questionMap.get(String(item.question_id));
    const selectedAnswer = answerMap.get(String(item.answer_id));

    if (
      !question ||
      !selectedAnswer ||
      selectedAnswer.question_id !== question.id
    ) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid answer for the submitted question',
      });
    }

    const isCorrect = Number(selectedAnswer.correct) === 1;

    if (isCorrect) {
      userGrade += Number(question.grade ?? 0);
    }

    resultData[String(item.question_id)] = {
      answer: item.answer_id,
      correct: isCorrect,
    };
  }

  // 9. Calculate pass/fail
  const passMark = Number(quiz.pass_mark ?? 0);
  const status = userGrade >= passMark ? 'pass' : 'failed';

  // 10. Save result
  const quizResult = await this.prisma.quiz_results.create({
    data: {
      user_id: userIdBigInt,
      quiz_id: quiz.id,
      result: resultData,
      user_grade: userGrade,
      status: status as any,
    },
  });

  return {
    status: 'success',
    data: {
      ...quizResult,
      id: quizResult.id.toString(),
      user_id: quizResult.user_id.toString(),
      quiz_id: quizResult.quiz_id.toString(),
    },
  };
}

async quizResults(
  userId: string | number,
  slug: string,
  quizId: number,
) {
  const userIdBigInt = BigInt(userId);

  // 1. Find course
  const course = await this.prisma.courses.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 2. Verify enrollment
  const enrollment = await this.prisma.enrollments.findFirst({
    where: {
      user_id: userIdBigInt,
      course_id: course.id,
      has_access: true,
    },
  });

  if (!enrollment) {
    throw new NotFoundException({
      status: 'error',
      message: 'Enrollment check failed',
    });
  }

  // 3. Verify quiz belongs to the course
  const quiz = await this.prisma.quizzes.findFirst({
    where: {
      id: BigInt(quizId),
      course_id: course.id,
    },
    select: {
      id: true,
    },
  });

  if (!quiz) {
    throw new NotFoundException({
      status: 'error',
      message: 'Quiz not found',
    });
  }

  // 4. Get this student's result
  const result = await this.prisma.quiz_results.findFirst({
    where: {
      user_id: userIdBigInt,
      quiz_id: quiz.id,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  if (!result) {
    throw new NotFoundException({
      status: 'error',
      message: 'Quiz result not found',
    });
  }

  return {
    status: 'success',
    data: {
      ...result,
      id: result.id.toString(),
      user_id: result.user_id.toString(),
      quiz_id: result.quiz_id.toString(),
    },
  };
}

async quizAttempts(
  userId: string | number,
  page = 1,
  limit = 10,
) {
  const userIdBigInt = BigInt(userId);

  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  const where = {
    user_id: userIdBigInt,
  };

  const [attempts, total] = await Promise.all([
    this.prisma.quiz_results.findMany({
      where,
      orderBy: [
        { created_at: 'desc' },
        { id: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),

    this.prisma.quiz_results.count({ where }),
  ]);

  // No attempts found
  if (attempts.length === 0) {
    return {
      status: 'success',
      data: [],
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  // Fetch quizzes separately to avoid relation dependencies
  const quizIds = [
    ...new Set(attempts.map((item) => item.quiz_id.toString())),
  ].map((id) => BigInt(id));

  const quizzes = await this.prisma.quizzes.findMany({
    where: {
      id: { in: quizIds },
    },
  });

  const quizMap = new Map(
    quizzes.map((quiz) => [quiz.id.toString(), quiz]),
  );

  // Fetch related courses
  const courseIds = [
    ...new Set(quizzes.map((quiz) => quiz.course_id.toString())),
  ].map((id) => BigInt(id));

  const courses =
    courseIds.length > 0
      ? await this.prisma.courses.findMany({
          where: {
            id: { in: courseIds },
          },
        })
      : [];

  const courseMap = new Map(
    courses.map((course) => [course.id.toString(), course]),
  );

  const data = attempts.map((attempt) => {
    const quiz = quizMap.get(attempt.quiz_id.toString());

    const course = quiz
      ? courseMap.get(quiz.course_id.toString())
      : undefined;

    return {
      ...attempt,
      id: attempt.id.toString(),
      user_id: attempt.user_id.toString(),
      quiz_id: attempt.quiz_id.toString(),
      quiz: quiz
        ? {
            ...quiz,
            id: quiz.id.toString(),
            chapter_item_id: quiz.chapter_item_id.toString(),
            instructor_id: quiz.instructor_id.toString(),
            chapter_id: quiz.chapter_id.toString(),
            course_id: quiz.course_id.toString(),
            course: course
              ? {
                  ...course,
                  id: course.id.toString(),
                }
              : null,
          }
        : null,
    };
  });

  return {
    status: 'success',
    data,
    pagination: {
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
    },
  };
}

async quizAttemptDetails(
  userId: string | number,
  attemptId: number,
) {
  const attempt = await this.prisma.quiz_results.findFirst({
    where: {
      id: BigInt(attemptId),
      user_id: BigInt(userId),
    },
  });

  if (!attempt) {
    throw new NotFoundException({
      status: 'error',
      message: 'Quiz attempt not found',
    });
  }

  const quiz = await this.prisma.quizzes.findUnique({
    where: {
      id: attempt.quiz_id,
    },
  });

  const course = quiz
    ? await this.prisma.courses.findUnique({
        where: {
          id: quiz.course_id,
        },
      })
    : null;

  return {
    status: 'success',
    data: {
      ...attempt,
      id: attempt.id.toString(),
      user_id: attempt.user_id.toString(),
      quiz_id: attempt.quiz_id.toString(),
      quiz: quiz
        ? {
            ...quiz,
            id: quiz.id.toString(),
            chapter_item_id: quiz.chapter_item_id.toString(),
            instructor_id: quiz.instructor_id.toString(),
            chapter_id: quiz.chapter_id.toString(),
            course_id: quiz.course_id.toString(),
            course: course
              ? {
                  ...course,
                  id: course.id.toString(),
                }
              : null,
          }
        : null,
    },
  };
}
}