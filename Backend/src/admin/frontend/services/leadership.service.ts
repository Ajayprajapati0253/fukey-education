import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LeadershipDto } from '../dto/leadership.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadershipService {
  private readonly sectionName = 'leadership';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async index(code = 'en') {
    const language =
      await this.prisma.languages.findFirst({
        where: {
          code,
        },
      });

    if (!language) {
      throw new NotFoundException(
        'Language not found',
      );
    }

    const home =
      await this.prisma.homes.findUnique({
        where: {
          slug: this.homeSlug,
        },
      });

    if (!home) {
      return {
        code,
        leadership: null,
        languages:
          await this.prisma.languages.findMany({
            orderBy: {
              id: 'asc',
            },
          }),
      };
    }

    const section =
      await this.prisma.sections.findFirst({
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
      });

    return {
      code,
      leadership: section,
      content:
        section?.section_translations[0]?.content ??
        null,
      languages:
        await this.prisma.languages.findMany({
          orderBy: {
            id: 'asc',
          },
        }),
    };
  }

  async update(
    dto: LeadershipDto,
    image?: Express.Multer.File,
  ) {
    const home =
      await this.prisma.homes.upsert({
        where: {
          slug: this.homeSlug,
        },
        update: {},
        create: {
          slug: this.homeSlug,
        },
      });

    const existingSection =
      await this.prisma.sections.findFirst({
        where: {
          home_id: home.id,
          name: this.sectionName,
        },
      });

    const existingGlobalContent =
      (existingSection?.global_content as Record<
        string,
        any
      >) ?? {};

    const globalContent = {
      ...existingGlobalContent,
    };

    if (dto.button_url !== undefined) {
      globalContent.button_url =
        dto.button_url;
    }

    if (image) {
      globalContent.image =
        `${this.uploadPath}/${image.filename}`;
    }

    const translationContent: Record<
      string,
      any
    > = {};

    if (dto.short_title !== undefined) {
      translationContent.short_title =
        dto.short_title;
    }

    if (dto.title !== undefined) {
      translationContent.title = dto.title;
    }

    if (dto.description !== undefined) {
      translationContent.description =
        dto.description;
    }

    if (dto.button_text !== undefined) {
      translationContent.button_text =
        dto.button_text;
    }

    const section =
      await this.prisma.$transaction(
        async (tx) => {
          let currentSection =
            existingSection;

          if (!currentSection) {
            currentSection =
              await tx.sections.create({
                data: {
                  home_id: home.id,
                  name: this.sectionName,
                  global_content: globalContent,
                  status: true,
                },
              });
          } else {
            currentSection =
              await tx.sections.update({
                where: {
                  id: currentSection.id,
                },
                data: {
                  global_content:
                    globalContent,
                },
              });
          }

          const translation =
            await tx.section_translations.findFirst(
              {
                where: {
                  section_id:
                    currentSection.id,
                  lang_code: dto.code,
                },
              },
            );

          if (translation) {
            const existingContent =
              (translation.content as Record<
                string,
                any
              >) ?? {};

            await tx.section_translations.update(
              {
                where: {
                  id: translation.id,
                },
                data: {
                  content: {
                    ...existingContent,
                    ...translationContent,
                  },
                },
              },
            );
          } else {
            await tx.section_translations.create({
              data: {
                section_id:
                  currentSection.id,
                lang_code: dto.code,
                content:
                  translationContent,
              },
            });
          }

          return currentSection;
        },
      );

    return this.index(dto.code);
  }
}