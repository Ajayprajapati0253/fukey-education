import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OurFeaturesSectionDto } from '../dto/our-features-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OurFeaturesSectionService {
  private readonly sectionName = 'our_features_section';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async index(code = 'en') {
    const language =
      await this.prisma.languages.findFirst({
        where: { code },
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
        ourFeature: null,
        content: null,
        languages:
          await this.prisma.languages.findMany({
            orderBy: { id: 'asc' },
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
      ourFeature: section,
      content:
        section?.section_translations[0]?.content ??
        null,
      languages:
        await this.prisma.languages.findMany({
          orderBy: { id: 'asc' },
        }),
    };
  }

  async update(
    dto: OurFeaturesSectionDto,
    files: {
      image_one?: Express.Multer.File[];
      image_two?: Express.Multer.File[];
      image_three?: Express.Multer.File[];
      image_four?: Express.Multer.File[];
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

    if (dto.button_url_one !== undefined) {
      globalContent.button_url_one =
        dto.button_url_one;
    }

    if (dto.button_url_two !== undefined) {
      globalContent.button_url_two =
        dto.button_url_two;
    }

    if (dto.button_url_three !== undefined) {
      globalContent.button_url_three =
        dto.button_url_three;
    }

    if (dto.button_url_four !== undefined) {
      globalContent.button_url_four =
        dto.button_url_four;
    }

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

    if (files.image_four?.[0]) {
      globalContent.image_four =
        `${this.uploadPath}/${files.image_four[0].filename}`;
    }

    const content: Record<string, any> = {
      ...(dto.sec_title !== undefined && {
        sec_title: dto.sec_title,
      }),
      ...(dto.sec_description !== undefined && {
        sec_description: dto.sec_description,
      }),
      title_one: dto.title_one,
      sub_title_one: dto.sub_title_one,
      title_two: dto.title_two,
      sub_title_two: dto.sub_title_two,
      title_three: dto.title_three,
      sub_title_three: dto.sub_title_three,
      ...(dto.title_four !== undefined && {
        title_four: dto.title_four,
      }),
      ...(dto.sub_title_four !== undefined && {
        sub_title_four: dto.sub_title_four,
      }),
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
                ...content,
              },
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