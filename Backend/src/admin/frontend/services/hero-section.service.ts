import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroSectionDto } from '../dto/hero-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HeroSectionService {
  private readonly sectionName = 'hero_section';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(private readonly prisma: PrismaService) {}

  private getGlobalContent(
    dto: HeroSectionDto,
    files: {
      banner_image?: Express.Multer.File[];
      banner_background?: Express.Multer.File[];
      banner_background_two?: Express.Multer.File[];
      hero_background?: Express.Multer.File[];
      enroll_students_image?: Express.Multer.File[];
    },
    existing: any = {},
  ) {
    const globalContent: any = {
      ...existing,
    };

    if (dto.action_button_url !== undefined) {
      globalContent.action_button_url =
        dto.action_button_url;
    }

    if (dto.video_button_url !== undefined) {
      globalContent.video_button_url =
        dto.video_button_url;
    }

    if (dto.booking_number !== undefined) {
      globalContent.booking_number =
        dto.booking_number;
    }

    if (files.banner_image?.[0]) {
      globalContent.banner_image =
        `${this.uploadPath}/${files.banner_image[0].filename}`;
    }

    if (files.banner_background?.[0]) {
      globalContent.banner_background =
        `${this.uploadPath}/${files.banner_background[0].filename}`;
    }

    if (files.banner_background_two?.[0]) {
      globalContent.banner_background_two =
        `${this.uploadPath}/${files.banner_background_two[0].filename}`;
    }

    if (files.hero_background?.[0]) {
      globalContent.hero_background =
        `${this.uploadPath}/${files.hero_background[0].filename}`;
    }

    if (files.enroll_students_image?.[0]) {
      globalContent.enroll_students_image =
        `${this.uploadPath}/${files.enroll_students_image[0].filename}`;
    }

    return globalContent;
  }

  private getTranslationContent(dto: HeroSectionDto) {
    const content: any = {};

    if (dto.short_title !== undefined) {
      content.short_title = dto.short_title;
    }

    if (dto.title !== undefined) {
      content.title = dto.title;
    }

    if (dto.sub_title !== undefined) {
      content.sub_title = dto.sub_title;
    }

    if (dto.total_student !== undefined) {
      content.total_student = dto.total_student;
    }

    if (dto.total_instructor !== undefined) {
      content.total_instructor = dto.total_instructor;
    }

    if (dto.total_courses !== undefined) {
      content.total_courses = dto.total_courses;
    }

    if (dto.average_reviews !== undefined) {
      content.average_reviews = dto.average_reviews;
    }

    if (dto.video_button_text !== undefined) {
      content.video_button_text =
        dto.video_button_text;
    }

    if (dto.action_button_text !== undefined) {
      content.action_button_text =
        dto.action_button_text;
    }

    return content;
  }

  async index(code = 'en') {
    const language = await this.prisma.languages.findFirst({
      where: { code },
    });

    if (!language) {
      throw new NotFoundException(
        'Language not found',
      );
    }

    const home = await this.prisma.homes.findUnique({
      where: {
        slug: this.homeSlug,
      },
    });

    if (!home) {
      return {
        code,
        languages: await this.prisma.languages.findMany({
          orderBy: { id: 'asc' },
        }),
        heroSections: [],
      };
    }

    const heroSections =
      await this.prisma.sections.findMany({
        where: {
          home_id: home.id,
          name: this.sectionName,
        },
        include: {
          section_translations: {
            where: {
              lang_code: code,
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

    return {
      code,
      languages: await this.prisma.languages.findMany({
        orderBy: { id: 'asc' },
      }),
      heroSections,
    };
  }

  async show(id: bigint, code = 'en') {
    const section =
      await this.prisma.sections.findUnique({
        where: { id },
        include: {
          section_translations: {
            where: {
              lang_code: code,
            },
          },
        },
      });

    if (!section || section.name !== this.sectionName) {
      throw new NotFoundException(
        'Hero section not found',
      );
    }

    return {
      ...section,
      code,
      content:
        section.section_translations[0]?.content ?? null,
      languages: await this.prisma.languages.findMany({
        orderBy: { id: 'asc' },
      }),
    };
  }

  async store(
    dto: HeroSectionDto,
    files: {
      banner_image?: Express.Multer.File[];
      banner_background?: Express.Multer.File[];
      banner_background_two?: Express.Multer.File[];
      hero_background?: Express.Multer.File[];
      enroll_students_image?: Express.Multer.File[];
    },
  ) {
    if (!files.banner_image?.[0]) {
      throw new Error(
        'banner_image is required',
      );
    }

    if (!files.hero_background?.[0]) {
      throw new Error(
        'hero_background is required',
      );
    }

    const home = await this.prisma.homes.upsert({
      where: {
        slug: this.homeSlug,
      },
      update: {},
      create: {
        slug: this.homeSlug,
      },
    });

    const globalContent =
      this.getGlobalContent(dto, files);

    const translationContent =
      this.getTranslationContent(dto);

    const section =
      await this.prisma.$transaction(
        async (tx) => {
          const created =
            await tx.sections.create({
              data: {
                home_id: home.id,
                name: this.sectionName,
                global_content: globalContent,
                status: true,
              },
            });

          await tx.section_translations.create({
            data: {
              section_id: created.id,
              lang_code: 'en',
              content: translationContent,
            },
          });

          return created;
        },
      );

    return this.show(section.id, 'en');
  }

  async update(
    id: bigint,
    dto: HeroSectionDto,
    files: {
      banner_image?: Express.Multer.File[];
      banner_background?: Express.Multer.File[];
      banner_background_two?: Express.Multer.File[];
      hero_background?: Express.Multer.File[];
      enroll_students_image?: Express.Multer.File[];
    },
  ) {
    const section =
      await this.prisma.sections.findUnique({
        where: { id },
      });

    if (!section || section.name !== this.sectionName) {
      throw new NotFoundException(
        'Hero section not found',
      );
    }

    const existingGlobal =
      (section.global_content as Record<string, any>) ??
      {};

    const globalContent =
      this.getGlobalContent(
        dto,
        files,
        existingGlobal,
      );

    const translationContent =
      this.getTranslationContent(dto);

    const code =
      (dto as any).code ?? 'en';

    await this.prisma.$transaction(
      async (tx) => {
        await tx.sections.update({
          where: { id },
          data: {
            global_content: globalContent,
          },
        });

        const translation =
          await tx.section_translations.findFirst({
            where: {
              section_id: id,
              lang_code: code,
            },
          });

        if (translation) {
          const existingContent =
            (translation.content as Record<string, any>) ??
            {};

          await tx.section_translations.update({
            where: {
              id: translation.id,
            },
            data: {
              content: {
                ...existingContent,
                ...translationContent,
              },
            },
          });
        } else {
          await tx.section_translations.create({
            data: {
              section_id: id,
              lang_code: code,
              content: translationContent,
            },
          });
        }
      },
    );

    return this.show(id, code);
  }

  async destroy(id: bigint) {
    const section =
      await this.prisma.sections.findUnique({
        where: { id },
      });

    if (!section || section.name !== this.sectionName) {
      throw new NotFoundException(
        'Hero section not found',
      );
    }

    await this.prisma.sections.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Hero section deleted successfully',
    };
  }

  async toggleStatus(id: bigint) {
    const section =
      await this.prisma.sections.findUnique({
        where: { id },
      });

    if (!section || section.name !== this.sectionName) {
      throw new NotFoundException(
        'Hero section not found',
      );
    }

    const updated =
      await this.prisma.sections.update({
        where: { id },
        data: {
          status: !section.status,
        },
      });

    return {
      success: true,
      status: updated.status,
    };
  }
}