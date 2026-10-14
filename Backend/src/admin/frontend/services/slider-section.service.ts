import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SliderSectionDto } from '../dto/slider-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SliderSectionService {
  private readonly sectionName = 'slider_section';
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
        sliderSection: null,
        content: null,
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
      sliderSection: section,
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
    dto: SliderSectionDto,
    files: {
      image_one?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
      image_three?: Express.Multer.File[];
    },
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

    const section =
      await this.prisma.sections.findFirst({
        where: {
          home_id: home.id,
          name: this.sectionName,
        },
      });

    const existingGlobalContent =
      (section?.global_content as Record<string, any>) ??
      {};

    const globalContent = {
      ...existingGlobalContent,
    };

    if (files.image_one?.[0]) {
      globalContent.image_one =
        `${this.uploadPath}/${files.image_one[0].filename}`;
    }

    if (files.image_two?.[0]) {
      globalContent.image_two =
        `${this.uploadPath}/${files.image_two[0].filename}`;
    }

    if (files.image_three?.[0]) {
      globalContent.image_three =
        `${this.uploadPath}/${files.image_three[0].filename}`;
    }

    const content = {
      short_title_one: dto.short_title_one,
      title_one: dto.title_one,
      sub_title_one: dto.sub_title_one,

      short_title_two: dto.short_title_two,
      title_two: dto.title_two,
      sub_title_two: dto.sub_title_two,

      short_title_three: dto.short_title_three,
      title_three: dto.title_three,
      sub_title_three: dto.sub_title_three,
    };

    await this.prisma.$transaction(
      async (tx) => {
        let currentSection = section;

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
                global_content: globalContent,
              },
            });
        }

        const translation =
          await tx.section_translations.findFirst({
            where: {
              section_id: currentSection.id,
              lang_code: dto.code,
            },
          });

        if (translation) {
          await tx.section_translations.update({
            where: {
              id: translation.id,
            },
            data: {
              content,
            },
          });
        } else {
          await tx.section_translations.create({
            data: {
              section_id: currentSection.id,
              lang_code: dto.code,
              content,
            },
          });
        }
      },
    );

    return this.index(dto.code);
  }
}