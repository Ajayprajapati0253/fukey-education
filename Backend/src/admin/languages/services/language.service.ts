import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { LanguageDto } from '../dto/language.dto';

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class LanguageService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================
  // LIST
  // =========================================================

  async findAll(page = 1) {
    const perPage = 15;
    const currentPage = page > 0 ? page : 1;
    const skip = (currentPage - 1) * perPage;

    const [languages, total] = await Promise.all([
      this.prisma.languages.findMany({
        orderBy: {
          id: 'asc',
        },
        skip,
        take: perPage,
      }),

      this.prisma.languages.count(),
    ]);

    return {
      data: languages,
      meta: {
        current_page: currentPage,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
      },
    };
  }

  // =========================================================
  // SHOW
  // =========================================================

  async findOne(id: bigint) {
    const language = await this.prisma.languages.findUnique({
      where: {
        id,
      },
    });

    if (!language) {
      throw new NotFoundException(
        'Language not found',
      );
    }

    return language;
  }

  // =========================================================
  // CREATE
  // =========================================================

  async create(dto: LanguageDto) {
    const existingName =
      await this.prisma.languages.findUnique({
        where: {
          name: dto.name,
        },
      });

    if (existingName) {
      throw new BadRequestException(
        'The name has already been taken.',
      );
    }

    const existingCode =
      await this.prisma.languages.findUnique({
        where: {
          code: dto.code,
        },
      });

    if (existingCode) {
      throw new BadRequestException(
        'The code has already been taken.',
      );
    }

    const defaultLanguage =
      await this.prisma.languages.findFirst({
        orderBy: {
          id: 'asc',
        },
      });

    const direction =
      this.getTextDirection(dto.code);

    return this.prisma.$transaction(
      async (tx) => {
        const language =
          await tx.languages.create({
            data: {
              name: dto.name,
              code: dto.code,
              direction,
            },
          });

        if (
          defaultLanguage &&
          defaultLanguage.code !== language.code
        ) {
          await this.syncCreateTranslations(
            tx,
            defaultLanguage.code,
            language.code,
          );
        }

        return language;
      },
    );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    id: bigint,
    dto: LanguageDto,
  ) {
    const language = await this.findOne(id);

    const existingName =
      await this.prisma.languages.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

    if (existingName) {
      throw new BadRequestException(
        'The name has already been taken.',
      );
    }

    const existingCode =
      await this.prisma.languages.findFirst({
        where: {
          code: dto.code,
          NOT: {
            id,
          },
        },
      });

    if (existingCode) {
      throw new BadRequestException(
        'The code has already been taken.',
      );
    }

    const oldCode = language.code;
    const newCode = dto.code;

    const direction =
      this.getTextDirection(newCode);

    return this.prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.languages.update({
            where: {
              id,
            },
            data: {
              name: dto.name,
              code: newCode,
              direction,
            },
          });

        if (oldCode !== newCode) {
          await this.syncUpdateTranslations(
            tx,
            oldCode,
            newCode,
          );
        }

        return updated;
      },
    );
  }

  // =========================================================
  // DELETE
  // =========================================================

  async remove(id: bigint) {
    const language = await this.findOne(id);

    if (language.id === BigInt(1)) {
      throw new BadRequestException(
        'Default language cannot be deleted.',
      );
    }

    if (language.code === 'en') {
      throw new BadRequestException(
        'English language cannot be deleted.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        await this.syncDeleteTranslations(
          tx,
          language.code,
        );

        await tx.languages.delete({
          where: {
            id,
          },
        });

        return {
          status: true,
          message:
            'Language deleted successfully.',
        };
      },
    );
  }

  // =========================================================
  // STATUS
  // =========================================================

  async updateStatus(
    id: bigint,
    column: string,
  ) {
    const language = await this.findOne(id);

    if (
      column !== 'is_default' &&
      column !== 'status'
    ) {
      throw new BadRequestException(
        'Invalid status column.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        // ---------------------------------------------
        // DEFAULT LANGUAGE
        // ---------------------------------------------

        if (column === 'is_default') {
          const isDefault =
            language.is_default === '1'
              ? '0'
              : '1';

          if (isDefault === '0') {
            const defaultLanguages =
              await tx.languages.count({
                where: {
                  is_default: '1',
                },
              });

            if (defaultLanguages === 1) {
              return {
                status: false,
                message:
                  'Should Have At Least One Default Language!',
              };
            }
          }

          await tx.languages.updateMany({
            where: {
              is_default: '1',
            },
            data: {
              is_default: '0',
            },
          });

          const updated =
            await tx.languages.update({
              where: {
                id,
              },
              data: {
                is_default: isDefault,

                ...(language.status === '0'
                  ? {
                      status: '1',
                    }
                  : {}),
              },
            });

          return {
            status: true,
            message:
              'Language status updated successfully.',
            data: updated,
          };
        }

        // ---------------------------------------------
        // ACTIVE STATUS
        // ---------------------------------------------

        const newStatus =
          language.status === '1'
            ? '0'
            : '1';

        if (newStatus === '0') {
          const activeLanguages =
            await tx.languages.count({
              where: {
                status: '1',
              },
            });

          if (activeLanguages === 1) {
            return {
              status: false,
              message:
                'Should Have At Least One Active Language!',
            };
          }
        }

        const finalStatus =
          language.is_default === '1'
            ? '1'
            : newStatus;

        const updated =
          await tx.languages.update({
            where: {
              id,
            },
            data: {
              status: finalStatus,
            },
          });

        return {
          status: true,
          message:
            'Language status updated successfully.',
          data: updated,
        };
      },
    );
  }

  // =========================================================
  // CREATE TRANSLATIONS
  // =========================================================

  private async syncCreateTranslations(
    tx: TransactionClient,
    defaultCode: string,
    newCode: string,
  ) {
    const now = new Date();

    // -------------------------------------------------------
    // BLOG
    // -------------------------------------------------------

    const blogs =
      await tx.blog_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (blogs.length > 0) {
      await tx.blog_translations.createMany({
        data: blogs.map((item) => ({
          blog_id: item.blog_id,
          lang_code: newCode,
          title: item.title,
          description: item.description,
          seo_title: item.seo_title,
          seo_description:
            item.seo_description,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // BLOG CATEGORY
    // -------------------------------------------------------

    const blogCategories =
      await tx.blog_category_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (blogCategories.length > 0) {
      await tx.blog_category_translations.createMany({
        data: blogCategories.map((item) => ({
          blog_category_id:
            item.blog_category_id,
          lang_code: newCode,
          title: item.title,
          short_description:
            item.short_description,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // TESTIMONIAL
    // -------------------------------------------------------

    const testimonials =
      await tx.testimonial_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (testimonials.length > 0) {
      await tx.testimonial_translations.createMany({
        data: testimonials.map((item) => ({
          testimonial_id:
            item.testimonial_id,
          lang_code: newCode,
          name: item.name,
          designation: item.designation,
          comment: item.comment,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // FAQ
    // -------------------------------------------------------

    const faqs =
      await tx.faq_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (faqs.length > 0) {
      await tx.faq_translations.createMany({
        data: faqs.map((item) => ({
          faq_id: item.faq_id,
          lang_code: newCode,
          question: item.question,
          answer: item.answer,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // COURSE CATEGORY
    // -------------------------------------------------------

    const courseCategories =
      await tx.course_category_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (courseCategories.length > 0) {
      await tx.course_category_translations.createMany({
        data: courseCategories.map((item) => ({
          course_category_id:
            item.course_category_id,
          lang_code: newCode,
          name: item.name,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // COURSE LEVEL
    // -------------------------------------------------------

    const courseLevels =
      await tx.course_level_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (courseLevels.length > 0) {
      await tx.course_level_translations.createMany({
        data: courseLevels.map((item) => ({
          course_level_id:
            item.course_level_id,
          lang_code: newCode,
          name: item.name,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // FREE COURSE CATEGORY
    // -------------------------------------------------------

    const freeCourseCategories =
      await tx.free_course_category_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (freeCourseCategories.length > 0) {
      await tx.free_course_category_translations.createMany({
        data: freeCourseCategories.map((item) => ({
          free_course_category_id:
            item.free_course_category_id,
          lang_code: newCode,
          name: item.name,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // FREE COURSE LEVEL
    // -------------------------------------------------------

    const freeCourseLevels =
      await tx.free_course_level_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (freeCourseLevels.length > 0) {
      await tx.free_course_level_translations.createMany({
        data: freeCourseLevels.map((item) => ({
          free_course_level_id:
            item.free_course_level_id,
          lang_code: newCode,
          name: item.name,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // FEATURED INSTRUCTOR
    // -------------------------------------------------------

    const featuredInstructors =
      await tx.featured_instructor_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (featuredInstructors.length > 0) {
      await tx.featured_instructor_translations.createMany({
        data: featuredInstructors.map((item) => ({
          featured_instructor_section_id:
            item.featured_instructor_section_id,
          lang_code: newCode,
          title: item.title,
          sub_title: item.sub_title,
          button_text: item.button_text,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // MENU
    // -------------------------------------------------------

    const menus =
      await tx.menu_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (menus.length > 0) {
      await tx.menu_translations.createMany({
        data: menus.map((item) => ({
          menu_id: item.menu_id,
          lang_code: newCode,
          name: item.name,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // MENU ITEM
    // -------------------------------------------------------

    const menuItems =
      await tx.menu_item_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (menuItems.length > 0) {
      await tx.menu_item_translations.createMany({
        data: menuItems.map((item) => ({
          menu_item_id: item.menu_item_id,
          lang_code: newCode,
          label: item.label,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // CUSTOM PAGE
    // -------------------------------------------------------

    const customPages =
      await tx.custom_page_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (customPages.length > 0) {
      await tx.custom_page_translations.createMany({
        data: customPages.map((item) => ({
          custom_page_id:
            item.custom_page_id,
          lang_code: newCode,
          name: item.name,
          content: item.content,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // INSTRUCTOR REQUEST SETTING
    // -------------------------------------------------------

    const instructorSettings =
      await tx.instructor_request_setting_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (instructorSettings.length > 0) {
      await tx.instructor_request_setting_translations.createMany({
        data: instructorSettings.map((item) => ({
          instructor_request_setting_id:
            item.instructor_request_setting_id,
          lang_code: newCode,
          instructions: item.instructions,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // SECTION
    // -------------------------------------------------------

    const sections =
      await tx.section_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (sections.length > 0) {
  await tx.section_translations.createMany({
    data: sections.map((item) => ({
      section_id: item.section_id,
      lang_code: newCode,
      content:
        item.content === null
          ? Prisma.JsonNull
          : item.content,
      created_at: now,
      updated_at: now,
    })),
  });
    }

    // -------------------------------------------------------
    // NEWS
    // -------------------------------------------------------

    const news =
      await tx.news_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (news.length > 0) {
      await tx.news_translations.createMany({
        data: news.map((item) => ({
          news_id: item.news_id,
          lang_code: newCode,
          title: item.title,
          description: item.description,
          seo_title: item.seo_title,
          seo_description:
            item.seo_description,
          created_at: now,
          updated_at: now,
        })),
      });
    }

    // -------------------------------------------------------
    // NEWS CATEGORY
    // -------------------------------------------------------

    const newsCategories =
      await tx.news_category_translations.findMany({
        where: {
          lang_code: defaultCode,
        },
      });

    if (newsCategories.length > 0) {
      await tx.news_category_translations.createMany({
        data: newsCategories.map((item) => ({
          news_category_id:
            item.news_category_id,
          lang_code: newCode,
          title: item.title,
          short_description:
            item.short_description,
          created_at: now,
          updated_at: now,
        })),
      });
    }
  }

  // =========================================================
  // UPDATE TRANSLATION LANGUAGE CODE
  // =========================================================

  private async syncUpdateTranslations(
    tx: TransactionClient,
    oldCode: string,
    newCode: string,
  ) {
    await Promise.all([
      tx.blog_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.blog_category_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.testimonial_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.faq_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.course_category_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.course_level_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.free_course_category_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.free_course_level_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.featured_instructor_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.menu_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.menu_item_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.custom_page_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.instructor_request_setting_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.section_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.news_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),

      tx.news_category_translations.updateMany({
        where: {
          lang_code: oldCode,
        },
        data: {
          lang_code: newCode,
        },
      }),
    ]);
  }

  // =========================================================
  // DELETE TRANSLATIONS
  // =========================================================

  private async syncDeleteTranslations(
    tx: TransactionClient,
    code: string,
  ) {
    await Promise.all([
      tx.blog_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.blog_category_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.testimonial_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.faq_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.course_category_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.course_level_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.free_course_category_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.free_course_level_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.featured_instructor_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.menu_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.menu_item_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.custom_page_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.instructor_request_setting_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.section_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.news_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),

      tx.news_category_translations.deleteMany({
        where: {
          lang_code: code,
        },
      }),
    ]);
  }

  // =========================================================
  // TEXT DIRECTION
  // =========================================================

  private getTextDirection(
    languageCode: string,
  ): string {
    const rtlLanguageCodes = [
      'ar',
      'arc',
      'dv',
      'fa',
      'ha',
      'he',
      'khw',
      'ks',
      'ku',
      'ps',
      'ur',
      'yi',
    ];

    return rtlLanguageCodes.includes(
      languageCode.toLowerCase(),
    )
      ? 'rtl'
      : 'ltr';
  }
}