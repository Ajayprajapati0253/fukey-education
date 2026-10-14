
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UploadService } from '../../../common/upload/upload.service';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';

@Injectable()
export class TestimonialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(page = 1, limit = 15) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 15));

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.testimonials.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.testimonials.count(),
    ]);

    const ids = rows.map((item) => item.id);
    const translations = ids.length
      ? await this.prisma.testimonial_translations.findMany({
          where: { testimonial_id: { in: ids } },
          orderBy: { id: 'asc' },
        })
      : [];

    const data = rows.map((item) => ({
      ...item,
      translations: translations.filter(
        (translation) => translation.testimonial_id === item.id,
      ),
    }));

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: bigint) {
    const testimonial = await this.prisma.testimonials.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    const translations =
      await this.prisma.testimonial_translations.findMany({
        where: { testimonial_id: id },
        orderBy: { id: 'asc' },
      });

    return {
      success: true,
      data: { ...testimonial, translations },
    };
  }

  async edit(id: bigint, code?: string) {
    const result = await this.findOne(id);

    const languages = await this.prisma.languages.findMany({
      orderBy: { id: 'asc' },
    });

    if (code && !languages.some((language) => language.code === code)) {
      throw new NotFoundException('Language not found');
    }

    const selectedCode =
      code ??
      languages.find((language) => language.is_default === '1')?.code ??
      languages[0]?.code;

    return {
      ...result,
      selectedLanguage: selectedCode,
      languages,
      selectedTranslation: result.data.translations.find(
        (translation) => translation.lang_code === selectedCode,
      ) ?? null,
    };
  }

  async create(dto: CreateTestimonialDto, image?: string) {
    this.validateTranslations(dto.translations);

    const now = new Date();

    try {
      const testimonial = await this.prisma.$transaction(async (tx) => {
        const created = await tx.testimonials.create({
          data: {
            image: image ?? null,
            rating: dto.rating ?? '0',
            status: true,
            created_at: now,
            updated_at: now,
          },
        });

        await tx.testimonial_translations.createMany({
          data: dto.translations.map((translation) => ({
            testimonial_id: created.id,
            lang_code: translation.lang_code,
            name: translation.name,
            designation: translation.designation,
            comment: translation.comment,
            created_at: now,
            updated_at: now,
          })),
        });

        return created;
      });

      return {
        success: true,
        message: 'Testimonial created successfully',
        data: testimonial,
      };
    } catch (error) {
      if (image) this.uploadService.deleteFile(image);
      throw error;
    }
  }

  async update(
    id: bigint,
    dto: UpdateTestimonialDto,
    image?: string,
  ) {
    const existing = await this.prisma.testimonials.findUnique({
      where: { id },
    });

    if (!existing) {
      if (image) this.uploadService.deleteFile(image);
      throw new NotFoundException('Testimonial not found');
    }

    if (dto.translations) {
      this.validateTranslations(dto.translations);
    }

    const now = new Date();

    try {
      const testimonial = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.testimonials.update({
          where: { id },
          data: {
            ...(dto.rating !== undefined && { rating: dto.rating }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(image !== undefined && { image }),
            updated_at: now,
          },
        });

        for (const translation of dto.translations ?? []) {
          const current = await tx.testimonial_translations.findFirst({
            where: {
              testimonial_id: id,
              lang_code: translation.lang_code,
            },
          });

          if (current) {
            await tx.testimonial_translations.update({
              where: { id: current.id },
              data: {
                name: translation.name,
                designation: translation.designation,
                comment: translation.comment,
                updated_at: now,
              },
            });
          } else {
            await tx.testimonial_translations.create({
              data: {
                testimonial_id: id,
                lang_code: translation.lang_code,
                name: translation.name,
                designation: translation.designation,
                comment: translation.comment,
                created_at: now,
                updated_at: now,
              },
            });
          }
        }

        return updated;
      });

      if (image && existing.image && existing.image !== image) {
        this.uploadService.deleteFile(existing.image);
      }

      return {
        success: true,
        message: 'Testimonial updated successfully',
        data: testimonial,
      };
    } catch (error) {
      if (image) this.uploadService.deleteFile(image);
      throw error;
    }
  }

  async remove(id: bigint) {
    const existing = await this.prisma.testimonials.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.testimonial_translations.deleteMany({
        where: { testimonial_id: id },
      });

      await tx.testimonials.delete({
        where: { id },
      });
    });

    if (existing.image) {
      this.uploadService.deleteFile(existing.image);
    }

    return {
      success: true,
      message: 'Testimonial deleted successfully',
    };
  }

  async statusUpdate(id: bigint) {
    const existing = await this.prisma.testimonials.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    const updated = await this.prisma.testimonials.update({
      where: { id },
      data: {
        status: !existing.status,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated successfully',
      data: updated,
    };
  }

  private validateTranslations(
    translations: Array<{
      lang_code: string;
      name: string;
      designation: string;
      comment: string;
    }>,
  ) {
    if (!translations?.length) {
      throw new BadRequestException(
        'At least one testimonial translation is required',
      );
    }

    const codes = translations.map((item) => item.lang_code);
    if (new Set(codes).size !== codes.length) {
      throw new BadRequestException(
        'Duplicate lang_code in translations',
      );
    }
  }
}
