import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CounterSectionService {
  private readonly sectionName = 'counter_section';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateSection() {
    const home = await this.prisma.homes.findUnique({
      where: {
        slug: this.homeSlug,
      },
    });

    if (!home) {
      throw new NotFoundException('Main home not found');
    }

    let section = await this.prisma.sections.findFirst({
      where: {
        home_id: home.id,
        name: this.sectionName,
      },
    });

    if (!section) {
      section = await this.prisma.sections.create({
        data: {
          home_id: home.id,
          name: this.sectionName,
        },
      });
    }

    return section;
  }

  async get() {
    const section = await this.getOrCreateSection();

    const translation =
      await this.prisma.section_translations.findFirst({
        where: {
          section_id: section.id,
          lang_code: 'en',
        },
      });

    const languages = await this.prisma.languages.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return {
      success: true,
      data: {
        section: {
          id: section.id,
          name: section.name,
          global_content: section.global_content,
          content: translation?.content ?? null,
          lang_code: translation?.lang_code ?? 'en',
        },
        languages,
      },
    };
  }

  async update(data: {
    total_student_count?: number;
    total_instructor_count?: number;
    total_courses_count?: number;
    total_awards_count?: number;
    button_url?: string;
    section_title?: string;
    description?: string;
    button_text?: string;
    image?: string;
  }) {
    const section = await this.getOrCreateSection();

    const oldGlobalContent =
      (section.global_content as Prisma.JsonObject | null) ?? {};

    const globalContent: Record<string, any> = {
      ...oldGlobalContent,
    };

    /*
     * Laravel global content:
     *
     * total_student_count
     * total_instructor_count
     * total_courses_count
     * total_awards_count
     * button_url
     * image
     */

    if (data.total_student_count !== undefined) {
      globalContent.total_student_count =
        data.total_student_count;
    }

    if (data.total_instructor_count !== undefined) {
      globalContent.total_instructor_count =
        data.total_instructor_count;
    }

    if (data.total_courses_count !== undefined) {
      globalContent.total_courses_count =
        data.total_courses_count;
    }

    if (data.total_awards_count !== undefined) {
      globalContent.total_awards_count =
        data.total_awards_count;
    }

    if (data.button_url !== undefined) {
      globalContent.button_url = data.button_url;
    }

    if (data.image !== undefined) {
      globalContent.image =
        `${this.uploadPath}/${data.image}`;
    }

    await this.prisma.$transaction(async (tx) => {
      /*
       * Update global content
       */
      await tx.sections.update({
        where: {
          id: section.id,
        },
        data: {
          global_content:
            globalContent as Prisma.InputJsonValue,
          updated_at: new Date(),
        },
      });

      /*
       * Counter controller updates translated content
       * for non-main themes.
       *
       * Our NestJS migration uses main as the single
       * home source, so we keep the translation available
       * for the section.
       */

      const hasTranslation =
        await tx.section_translations.findFirst({
          where: {
            section_id: section.id,
          },
          select: {
            id: true,
          },
        });

      if (!hasTranslation) {
        const languages = await tx.languages.findMany({
          orderBy: {
            id: 'asc',
          },
        });

        const initialContent: Prisma.InputJsonObject = {
          title: data.section_title ?? null,
          description: data.description ?? null,
          button_text: data.button_text ?? null,
        };

        const now = new Date();

        for (const language of languages) {
          await tx.section_translations.create({
            data: {
              section_id: section.id,
              lang_code: language.code,
              content: initialContent,
              created_at: now,
              updated_at: now,
            },
          });
        }
      } else if (
        data.section_title !== undefined ||
        data.description !== undefined ||
        data.button_text !== undefined
      ) {
        const translation =
          await tx.section_translations.findFirst({
            where: {
              section_id: section.id,
              lang_code: 'en',
            },
          });

        const oldContent =
          (translation?.content as Prisma.JsonObject | null) ?? {};

        const content: Record<string, any> = {
          ...oldContent,
        };

        if (data.section_title !== undefined) {
          content.title = data.section_title;
        }

        if (data.description !== undefined) {
          content.description = data.description;
        }

        if (data.button_text !== undefined) {
          content.button_text = data.button_text;
        }

        if (translation) {
          await tx.section_translations.update({
            where: {
              id: translation.id,
            },
            data: {
              content: content as Prisma.InputJsonValue,
              updated_at: new Date(),
            },
          });
        }
      }
    });

    return this.get();
  }
}