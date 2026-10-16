import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FaqSectionService {
  private readonly sectionName = 'faq_section';
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
    short_title: string;
    title: string;
    description: string;
    total_languages?: string;
    image?: string;
    image_two?: string;
  }) {
    const section = await this.getOrCreateSection();

    const oldGlobalContent =
      (section.global_content as Prisma.JsonObject | null) ?? {};

    const globalContent: Record<string, any> = {
      ...oldGlobalContent,
    };

    /*
     * Laravel:
     *
     * updateSectionContent(
     *     $section?->global_content,
     *     $request,
     *     [],
     *     ['image', 'image_two']
     * );
     */

    if (data.image !== undefined) {
      globalContent.image =
        `${this.uploadPath}/${data.image}`;
    }

    if (data.image_two !== undefined) {
      globalContent.image_two =
        `${this.uploadPath}/${data.image_two}`;
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
       * Generate translations if none exist.
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
          short_title: data.short_title,
          title: data.title,
          description: data.description,
          total_languages: data.total_languages ?? null,
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
      }

      /*
       * Requested English translation.
       */
      const existingTranslation =
        await tx.section_translations.findFirst({
          where: {
            section_id: section.id,
            lang_code: 'en',
          },
        });

      const oldContent =
        (existingTranslation?.content as Prisma.JsonObject | null) ??
        {};

      const content: Record<string, any> = {
        ...oldContent,
        short_title: data.short_title,
        title: data.title,
        description: data.description,
      };

      if (data.total_languages !== undefined) {
        content.total_languages = data.total_languages;
      }

      if (existingTranslation) {
        await tx.section_translations.update({
          where: {
            id: existingTranslation.id,
          },
          data: {
            content: content as Prisma.InputJsonValue,
            updated_at: new Date(),
          },
        });
      } else {
        await tx.section_translations.create({
          data: {
            section_id: section.id,
            lang_code: 'en',
            content: content as Prisma.InputJsonValue,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    });

    return this.get();
  }
}