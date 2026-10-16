import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class AboutAffordableEducationService {
  private readonly sectionName = 'about_affordable_education';
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

    const translation = await this.prisma.section_translations.findFirst({
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
    image?: string;
  },
) {
  const section = await this.getOrCreateSection();

  const oldGlobalContent =
    (section.global_content as Prisma.JsonObject | null) ?? {};

  const oldImage =
    typeof oldGlobalContent.image === 'string'
      ? oldGlobalContent.image
      : null;

  const globalContent: Record<string, any> = {
    ...oldGlobalContent,
  };

  if (data.button_url !== undefined) {
    globalContent.button_url = data.button_url;
  }

  if (data.image !== undefined) {
    globalContent.image = `${this.uploadPath}/${data.image}`;
  }

  await this.prisma.$transaction(async (tx) => {
    /*
     * -----------------------------------------
     * 1. Update global section content
     * -----------------------------------------
     */
    await tx.sections.update({
      where: {
        id: section.id,
      },
      data: {
        global_content: globalContent as Prisma.InputJsonValue,
        updated_at: new Date(),
      },
    });

    /*
     * -----------------------------------------
     * 2. Check whether ANY translation exists
     * -----------------------------------------
     *
     * Laravel:
     * SectionTranslation::where('section_id', $section->id)->exists()
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
     * -----------------------------------------
     * 3. First-time translation generation
     * -----------------------------------------
     *
     * Laravel GenerateTranslationTrait creates
     * a translation for EVERY language.
     *
     * translateField = false for this controller,
     * so every language initially receives the
     * same submitted content.
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
     * -----------------------------------------
     * 4. Update requested language
     * -----------------------------------------
     *
     * Laravel updateTranslations():
     * requested code -> existing translation
     * -> update content
     */
    const existingTranslation =
      await tx.section_translations.findFirst({
        where: {
          section_id: section.id,
          lang_code: code,
        },
      });

    const oldContent =
      (existingTranslation?.content as Prisma.JsonObject | null) ?? {};

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
      /*
       * Normally this should only happen if the requested
       * language was added after the initial translations
       * were generated.
       */
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
   * -----------------------------------------
   * 5. Old image cleanup
   * -----------------------------------------
   *
   * Filesystem cleanup will happen only after
   * successful DB transaction.
   *
   * Keep this pending until the NestJS upload root
   * is confirmed.
   */
  if (data.image && oldImage && oldImage !== globalContent.image) {
    // TODO: delete old custom image from filesystem
  }

  return this.get(code);
}
}