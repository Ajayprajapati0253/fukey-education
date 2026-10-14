import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AboutSectionService {
  private readonly sectionName = 'about_section';
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

  async get(code: string) {
    const section = await this.getOrCreateSection();

    const translation =
      await this.prisma.section_translations.findFirst({
        where: {
          section_id: section.id,
          lang_code: code,
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
          lang_code: translation?.lang_code ?? code,
        },
        languages,
      },
    };
  }

  async update(
    code: string,
    data: {
      short_title?: string;
      title?: string;
      description?: string;
      button_text?: string;

      button_url?: string;
      video_url?: string;
      year_experience?: string;
      course_success?: string;
      phone_number?: string;

      image?: string;
      image_two?: string;
      image_three?: string;
    },
  ) {
    const section = await this.getOrCreateSection();

    const oldGlobalContent =
      (section.global_content as Prisma.JsonObject | null) ?? {};

    const oldImage =
      typeof oldGlobalContent.image === 'string'
        ? oldGlobalContent.image
        : null;

    const oldImageTwo =
      typeof oldGlobalContent.image_two === 'string'
        ? oldGlobalContent.image_two
        : null;

    const oldImageThree =
      typeof oldGlobalContent.image_three === 'string'
        ? oldGlobalContent.image_three
        : null;

    const globalContent: Record<string, any> = {
      ...oldGlobalContent,
    };

    /*
     * Laravel:
     *
     * ['button_url',
     *  'video_url',
     *  'year_experience',
     *  'course_success',
     *  'phone_number']
     */

    if (data.button_url !== undefined) {
      globalContent.button_url = data.button_url;
    }

    if (data.video_url !== undefined) {
      globalContent.video_url = data.video_url;
    }

    if (data.year_experience !== undefined) {
      globalContent.year_experience = data.year_experience;
    }

    if (data.course_success !== undefined) {
      globalContent.course_success = data.course_success;
    }

    if (data.phone_number !== undefined) {
      globalContent.phone_number = data.phone_number;
    }

    /*
     * Laravel:
     *
     * ['image', 'image_two', 'image_three']
     */

    if (data.image !== undefined) {
      globalContent.image = `${this.uploadPath}/${data.image}`;
    }

    if (data.image_two !== undefined) {
      globalContent.image_two = `${this.uploadPath}/${data.image_two}`;
    }

    if (data.image_three !== undefined) {
      globalContent.image_three =
        `${this.uploadPath}/${data.image_three}`;
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
       * Check whether translations already exist.
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

      /*
       * Same flow as Laravel:
       *
       * if (!$translation) {
       *     generateTranslations(...)
       * }
       */
      if (!hasTranslation) {
        const languages = await tx.languages.findMany({
          orderBy: {
            id: 'asc',
          },
        });

        const initialContent: Prisma.InputJsonObject = {
          short_title: data.short_title ?? null,
          title: data.title ?? null,
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
      }

      /*
       * Requested language translation
       */
      const existingTranslation =
        await tx.section_translations.findFirst({
          where: {
            section_id: section.id,
            lang_code: code,
          },
        });

      const oldContent =
        (existingTranslation?.content as Prisma.JsonObject | null) ??
        {};

      const content: Record<string, any> = {
        ...oldContent,
      };

      if (data.short_title !== undefined) {
        content.short_title = data.short_title;
      }

      if (data.title !== undefined) {
        content.title = data.title;
      }

      if (data.description !== undefined) {
        content.description = data.description;
      }

      if (data.button_text !== undefined) {
        content.button_text = data.button_text;
      }

      /*
       * Update or create translation
       */
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
            lang_code: code,
            content: content as Prisma.InputJsonValue,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    });

    /*
     * Old image deletion:
     * Exact filesystem configuration isn't available yet,
     * so intentionally not guessing the deletion path.
     */
    if (data.image && oldImage && oldImage !== globalContent.image) {
      // TODO: delete old image
    }

    if (
      data.image_two &&
      oldImageTwo &&
      oldImageTwo !== globalContent.image_two
    ) {
      // TODO: delete old image_two
    }

    if (
      data.image_three &&
      oldImageThree &&
      oldImageThree !== globalContent.image_three
    ) {
      // TODO: delete old image_three
    }

    return this.get(code);
  }
}