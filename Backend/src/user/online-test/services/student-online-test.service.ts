import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionBankDto } from '../dto/question-bank.dto';

@Injectable()
export class StudentOnlineTestService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestionBank(dto: QuestionBankDto) {
    if (!Number.isSafeInteger(dto.class_id) || dto.class_id < 1) {
      throw new BadRequestException('Invalid class_id');
    }

    if (!Number.isSafeInteger(dto.subject_id) || dto.subject_id < 1) {
      throw new BadRequestException('Invalid subject_id');
    }

    const search = dto.search?.trim();

    const questions = await this.prisma.questions.findMany({
      where: {
        class_id: BigInt(dto.class_id),
        subject_id: BigInt(dto.subject_id),
        status: true,
        question_type: 'mcq_single',
        ...(search
          ? {
              OR: [
                {
                  question: {
                    contains: search,
                  },
                },
                {
                  explanation: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        question_options: {
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 100,
    });

    // Convert BigInt IDs to strings so JSON serialization works.
    const data = questions.map((question) => ({
      ...question,
      id: question.id.toString(),
      class_id: question.class_id.toString(),
      subject_id: question.subject_id.toString(),
      chapter_id: question.chapter_id?.toString() ?? null,
      question_options: question.question_options.map((option) => ({
        ...option,
        id: option.id.toString(),
        question_id: option.question_id.toString(),
      })),
    }));

    return {
      success: true,
      message: 'Question bank loaded successfully.',
      data,
      count: data.length,
    };
  }
}