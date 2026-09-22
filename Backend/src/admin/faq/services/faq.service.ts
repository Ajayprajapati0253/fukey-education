import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET ALL FAQS
   *
   * Laravel:
   * Faq::with('translation')->paginate(15)
   */
  async findAll(page = 1, limit = 15, langCode = 'en') {
    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      this.prisma.faqs.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
      }),

      this.prisma.faqs.count(),
    ]);

    const faqIds = faqs.map((faq) => faq.id);

    const translations =
      faqIds.length > 0
        ? await this.prisma.faq_translations.findMany({
            where: {
              faq_id: {
                in: faqIds,
              },
              lang_code: langCode,
            },
          })
        : [];

    const translationMap = new Map(
      translations.map((translation) => [
        translation.faq_id.toString(),
        translation,
      ]),
    );

    const data = faqs.map((faq) => {
      const translation = translationMap.get(
        faq.id.toString(),
      );

      return this.serializeFaq(faq, translation);
    });

    return {
      data,
      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET SINGLE FAQ
   */
  async findOne(id: string, langCode = 'en') {
    const faqId = this.toBigInt(id);

    const faq = await this.prisma.faqs.findUnique({
      where: {
        id: faqId,
      },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    const translation =
      await this.prisma.faq_translations.findFirst({
        where: {
          faq_id: faqId,
          lang_code: langCode,
        },
      });

    return this.serializeFaq(faq, translation);
  }

  /**
   * CREATE FAQ
   *
   * Laravel:
   * $faq = Faq::create($request->validated());
   *
   * Then GenerateTranslationTrait creates translation.
   */
  async create(dto: CreateFaqDto) {
    const faq = await this.prisma.faqs.create({
      data: {
        status: true,
      },
    });

    try {
      await this.prisma.faq_translations.create({
        data: {
          faq_id: faq.id,
          lang_code: 'en',
          question: dto.question,
          answer: dto.answer,
        },
      });
    } catch (error) {
      // Roll back FAQ if translation creation fails.
      await this.prisma.faqs.delete({
        where: {
          id: faq.id,
        },
      });

      throw error;
    }

    const translation =
      await this.prisma.faq_translations.findFirst({
        where: {
          faq_id: faq.id,
          lang_code: 'en',
        },
      });

    return {
      success: true,
      message: 'FAQ created successfully',
      data: this.serializeFaq(faq, translation),
    };
  }

  /**
   * UPDATE FAQ
   */
  async update(id: string, dto: UpdateFaqDto) {
    const faqId = this.toBigInt(id);

    const faq = await this.prisma.faqs.findUnique({
      where: {
        id: faqId,
      },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.prisma.faqs.update({
      where: {
        id: faqId,
      },
      data: {},
    });

    await this.prisma.faq_translations.upsert({
      where: {
        id: await this.getTranslationId(
          faqId,
          'en',
        ),
      },
      create: {
        faq_id: faqId,
        lang_code: 'en',
        question: dto.question,
        answer: dto.answer,
      },
      update: {
        question: dto.question,
        answer: dto.answer,
      },
    });

    const translation =
      await this.prisma.faq_translations.findFirst({
        where: {
          faq_id: faqId,
          lang_code: 'en',
        },
      });

    return {
      success: true,
      message: 'FAQ updated successfully',
      data: this.serializeFaq(faq, translation),
    };
  }

  /**
   * DELETE FAQ
   *
   * Laravel explicitly deletes translations first.
   */
  async remove(id: string) {
    const faqId = this.toBigInt(id);

    const faq = await this.prisma.faqs.findUnique({
      where: {
        id: faqId,
      },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.prisma.$transaction([
      this.prisma.faq_translations.deleteMany({
        where: {
          faq_id: faqId,
        },
      }),

      this.prisma.faqs.delete({
        where: {
          id: faqId,
        },
      }),
    ]);

    return {
      success: true,
      message: 'FAQ deleted successfully',
    };
  }

  /**
   * STATUS UPDATE
   *
   * Laravel:
   * $status = $faq->status == 1 ? 0 : 1;
   */
  async statusUpdate(id: string) {
    const faqId = this.toBigInt(id);

    const faq = await this.prisma.faqs.findUnique({
      where: {
        id: faqId,
      },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    const updatedFaq =
      await this.prisma.faqs.update({
        where: {
          id: faqId,
        },
        data: {
          status: !faq.status,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        id: updatedFaq.id.toString(),
        status: updatedFaq.status,
      },
    };
  }

  /**
   * Get translation ID for upsert.
   *
   * Prisma upsert requires a unique field.
   * Since faq_id + lang_code is not currently
   * declared as @@unique in the Prisma schema,
   * we first find/create the translation manually.
   */
  private async getTranslationId(
    faqId: bigint,
    langCode: string,
  ): Promise<bigint> {
    const translation =
      await this.prisma.faq_translations.findFirst({
        where: {
          faq_id: faqId,
          lang_code: langCode,
        },
      });

    if (translation) {
      return translation.id;
    }

    const created =
      await this.prisma.faq_translations.create({
        data: {
          faq_id: faqId,
          lang_code: langCode,
        },
      });

    return created.id;
  }

  /**
   * Serialize BigInt values.
   */
  private serializeFaq(
    faq: any,
    translation?: any,
  ) {
    return {
      id: faq.id.toString(),
      status: faq.status,
      created_at: faq.created_at,
      updated_at: faq.updated_at,

      question: translation?.question ?? null,
      answer: translation?.answer ?? null,

      translation: translation
        ? {
            id: translation.id.toString(),
            faq_id: translation.faq_id.toString(),
            lang_code: translation.lang_code,
            question: translation.question,
            answer: translation.answer,
            created_at: translation.created_at,
            updated_at: translation.updated_at,
          }
        : null,
    };
  }

  /**
   * Convert string ID to BigInt.
   */
  private toBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('Invalid FAQ ID');
    }
  }
}