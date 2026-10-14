import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { QuestionQueryDto } from '../dto/question-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async findAll(query: QuestionQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: any = {};

    if (query.class_id) where.class_id = BigInt(query.class_id);
    if (query.subject_id) where.subject_id = BigInt(query.subject_id);
    if (query.chapter_id) where.chapter_id = BigInt(query.chapter_id);
    if (query.difficulty) where.difficulty = query.difficulty;

    if (query.search?.trim()) {
      where.question = {
        contains: query.search.trim(),
      };
    }

    const [questions, total] = await this.prisma.$transaction([
      this.prisma.questions.findMany({
        where,
        include: {
          question_options: {
            orderBy: { sort_order: 'asc' },
          },
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.questions.count({ where }),
    ]);

    return {
      success: true,
      message: 'Questions fetched successfully.',
      data: this.serialize(questions),
      pagination: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateQuestionDto) {
    const { options, ...questionData } = dto;

    const question = await this.prisma.questions.create({
      data: {
        class_id: BigInt(questionData.class_id),
        subject_id: BigInt(questionData.subject_id),
        chapter_id: questionData.chapter_id
          ? BigInt(questionData.chapter_id)
          : null,
        question: questionData.question,
        question_type: questionData.question_type ?? 'mcq_single',
        explanation: questionData.explanation ?? null,
        marks: questionData.marks ?? 1,
        negative_marks: questionData.negative_marks ?? 0,
        difficulty: questionData.difficulty ?? 'medium',
        language: questionData.language ?? 'en',
        status: questionData.status ?? true,
        ...(options
          ? {
              question_options: {
                create: options.map((option, index) => ({
                  option_key: option.option_key,
                  option_text: option.option_text,
                  is_correct: option.is_correct ?? false,
                  sort_order: index,
                })),
              },
            }
          : {}),
      },
      include: {
        question_options: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    return {
      success: true,
      message: 'Question created successfully.',
      data: this.serialize(question),
    };
  }

  async findOne(id: string) {
    const question = await this.prisma.questions.findUnique({
      where: { id: BigInt(id) },
      include: {
        question_options: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!question) {
      throw new NotFoundException({
        success: false,
        message: 'Question not found.',
      });
    }

    return {
      success: true,
      data: this.serialize(question),
    };
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const questionId = BigInt(id);
    const { options, ...fields } = dto;

    const existing = await this.prisma.questions.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Question not found.',
      });
    }

    const question = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (fields.class_id !== undefined) {
        updateData.class_id = BigInt(fields.class_id);
      }
      if (fields.subject_id !== undefined) {
        updateData.subject_id = BigInt(fields.subject_id);
      }
      if (fields.chapter_id !== undefined) {
        updateData.chapter_id =
          fields.chapter_id === null ? null : BigInt(fields.chapter_id);
      }
      if (fields.question !== undefined) updateData.question = fields.question;
      if (fields.question_type !== undefined) updateData.question_type = fields.question_type;
      if (fields.explanation !== undefined) updateData.explanation = fields.explanation;
      if (fields.marks !== undefined) updateData.marks = fields.marks;
      if (fields.negative_marks !== undefined) updateData.negative_marks = fields.negative_marks;
      if (fields.difficulty !== undefined) updateData.difficulty = fields.difficulty;
      if (fields.language !== undefined) updateData.language = fields.language;
      if (fields.status !== undefined) updateData.status = fields.status;

      await tx.questions.update({
        where: { id: questionId },
        data: updateData,
      });

      if (options !== undefined) {
        await tx.question_options.deleteMany({
          where: { question_id: questionId },
        });

        if (options.length) {
          await tx.question_options.createMany({
            data: options.map((option, index) => ({
              question_id: questionId,
              option_key: option.option_key,
              option_text: option.option_text,
              is_correct: option.is_correct ?? false,
              sort_order: index,
            })),
          });
        }
      }

      return tx.questions.findUnique({
        where: { id: questionId },
        include: {
          question_options: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });
    });

    return {
      success: true,
      message: 'Question updated successfully.',
      data: this.serialize(question),
    };
  }

  async remove(id: string) {
    const questionId = BigInt(id);

    const existing = await this.prisma.questions.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Question not found.',
      });
    }

    await this.prisma.questions.delete({
      where: { id: questionId },
    });

    return {
      success: true,
      message: 'Question deleted successfully.',
    };
  }
}