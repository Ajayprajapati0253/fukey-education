
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FrontendService {
  constructor(private readonly prisma: PrismaService) {}

  private notFound() {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  private toLimit(value: unknown, fallback: number) {
    const parsed = Number(value);
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }
    return Math.min(parsed, 100);
  }

  async settings() {
    const keys = [
      'app_name',
      'logo',
      'timezone',
      'primary_color',
      'secondary_color',
    ];

    const rows = await this.prisma.settings.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });

    const values = Object.fromEntries(
      rows.map((row) => [row.key, row.value]),
    );

    return {
      status: 'success',
      data: Object.fromEntries(
        keys.map((key) => [key, values[key] ?? '']),
      ),
    };
  }

  async allLanguages() {
    const rows = await this.prisma.languages.findMany({
      select: {
        code: true,
        name: true,
        direction: true,
        is_default: true,
        status: true,
      },
    });

    if (!rows.length) this.notFound();

    return {
      status: 'success',
      data: rows,
    };
  }

  async allCurrency() {
    const rows = await this.prisma.multi_currencies.findMany();

    if (!rows.length) this.notFound();

    return {
      status: 'success',
      data: rows,
    };
  }

  async getLanguageFile(code = 'en') {
    // Prevent directory traversal through the language code.
    if (!/^[a-zA-Z0-9_-]{1,20}$/.test(code)) {
      throw new BadRequestException('Invalid language code');
    }

    const baseDir = resolve(process.cwd(), 'lang');
    const filePath = join(baseDir, `${code}.json`);

    try {
      const content = await readFile(filePath, 'utf8');

      return {
        status: 'success',
        data: JSON.parse(content),
      };
    } catch (error) {
      if (
        error instanceof SyntaxError
      ) {
        throw new BadRequestException(
          'Language file contains invalid JSON',
        );
      }

      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
        code,
      });
    }
  }

  async courseLanguages(limitValue?: string) {
    const limit = this.toLimit(limitValue, 100);

    const rows = await this.prisma.course_languages.findMany({
      where: { status: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });

    if (!rows.length) this.notFound();

    return {
      status: 'success',
      data: rows.map((row) => ({
        ...row,
        id: row.id.toString(),
      })),
    };
  }

  async courseLevels(language = 'en', limitValue?: string) {
    const limit = this.toLimit(limitValue, 100);
    const code = language.toLowerCase();

    const levels = await this.prisma.course_levels.findMany({
      where: { status: true },
      select: { id: true, slug: true },
      orderBy: { slug: 'asc' },
      take: limit,
    });

    if (!levels.length) this.notFound();

    const translations =
      await this.prisma.course_level_translations.findMany({
        where: {
          course_level_id: {
            in: levels.map((level) => level.id),
          },
          lang_code: code,
        },
        select: {
          course_level_id: true,
          name: true,
        },
      });

    const names = new Map(
      translations.map((item) => [
        item.course_level_id.toString(),
        item.name,
      ]),
    );

    return {
      status: 'success',
      data: levels.map((level) => ({
        id: level.id.toString(),
        slug: level.slug,
        name: names.get(level.id.toString()) ?? null,
      })),
    };
  }

  async mainCategories(language = 'en', limitValue?: string) {
    const limit = this.toLimit(limitValue, 100);

    const categories = await this.prisma.course_categories.findMany({
      where: {
        parent_id: null,
        status: true,
      },
      select: {
        id: true,
        slug: true,
        icon: true,
        show_at_trending: true,
      },
      orderBy: { slug: 'asc' },
      take: limit,
    });

    if (!categories.length) this.notFound();

    const translations =
      await this.prisma.course_category_translations.findMany({
        where: {
          course_category_id: {
            in: categories.map((item) => item.id),
          },
          lang_code: language.toLowerCase(),
        },
        select: {
          course_category_id: true,
          name: true,
        },
      });

    const names = new Map(
      translations.map((item) => [
        item.course_category_id.toString(),
        item.name,
      ]),
    );

    return {
      status: 'success',
      data: categories.map((item) => ({
        id: item.id.toString(),
        slug: item.slug,
        icon: item.icon,
        show_at_trending: item.show_at_trending,
        name: names.get(item.id.toString()) ?? null,
      })),
    };
  }

  async subCategories(
    slug: string,
    language = 'en',
    limitValue?: string,
  ) {
    const limit = this.toLimit(limitValue, 100);

    const parent = await this.prisma.course_categories.findFirst({
      where: { slug, parent_id: null, status: true },
      select: { id: true },
    });

    if (!parent) {
  return this.notFound();
}

    const categories = await this.prisma.course_categories.findMany({
      where: {
        parent_id: parent.id,
        status: true,
      },
      select: { id: true, slug: true },
      orderBy: { slug: 'asc' },
      take: limit,
    });

    if (!categories.length) this.notFound();

    const translations =
      await this.prisma.course_category_translations.findMany({
        where: {
          course_category_id: {
            in: categories.map((item) => item.id),
          },
          lang_code: language.toLowerCase(),
        },
        select: { course_category_id: true, name: true },
      });

    const names = new Map(
      translations.map((item) => [
        item.course_category_id.toString(),
        item.name,
      ]),
    );

    return {
      status: 'success',
      data: categories.map((item) => ({
        id: item.id.toString(),
        slug: item.slug,
        name: names.get(item.id.toString()) ?? null,
      })),
    };
  }

  async countryList() {
    const rows = await this.prisma.countries.findMany({
      where: { status: true },
      select: { id: true, name: true },
    });

    if (!rows.length) this.notFound();

    return {
      status: 'success',
      data: rows.map((row) => ({
        id: row.id.toString(),
        name: row.name,
      })),
    };
  }

  async socialLinks() {
    const rows = await this.prisma.social_links.findMany({
      select: { icon: true, link: true },
    });

    if (!rows.length) this.notFound();

    return { status: 'success', data: rows };
  }

  async onboardingScreens() {
    return {
      status: 'success',
      data: [
        {
          title: 'Welcome to Fukey Education',
          description:
            'Class 9th se 12th tak ke students ke liye complete learning platform — simple explanations aur clear concepts ke saath.',
        },
        {
          title: 'Strong Concepts, Better Marks',
          description:
            'Maths, Science aur core subjects ko step-by-step samjho aur apne exams me better performance do.',
        },
        {
          title: 'Practice, Revise, Succeed',
          description:
            'Regular practice videos, easy revision aur doubt-friendly learning ke saath apne goals achieve karo.',
        },
      ],
    };
  }

  async contactUs(body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    phone?: string;
  }) {
    const errors: Record<string, string[]> = {};

    for (const key of ['name', 'email', 'subject', 'message'] as const) {
      if (!body[key]?.trim()) {
        errors[key] = [
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
        ];
      }
    }

    if (Object.keys(errors).length) {
      throw new BadRequestException({
        status: 'error',
        message: errors,
      });
    }

    await this.prisma.contact_messages.create({
      data: {
        name: body.name!.trim(),
        email: body.email!.trim(),
        subject: body.subject!.trim(),
        message: body.message!.trim(),
        phone: body.phone?.trim() || null,
      },
    });

    return {
      status: 'success',
      message: 'Message sent successfully',
    };
  }

  async newsletterRequest(emailValue?: string) {
    const email = emailValue?.trim().toLowerCase();

    if (!email) {
      throw new BadRequestException({
        status: 'error',
        message: { email: ['Email is required'] },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException({
        status: 'error',
        message: { email: ['Email must be valid'] },
      });
    }

    const existing = await this.prisma.news_letters.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException({
        status: 'error',
        message: { email: ['Email already exist'] },
      });
    }

    await this.prisma.news_letters.create({
      data: {
        email,
        verify_token: randomBytes(50).toString('hex'),
      },
    });

    return {
      status: 'success',
      message:
        'A verification link has been send to your email, please verify it and getting our newsletter',
    };
  }

  async customPage(slug: string, language = 'en') {
    const page = await this.prisma.custom_pages.findFirst({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!page) {
        return this.notFound();
    }

    const translation =
      await this.prisma.custom_page_translations.findFirst({
        where: {
          custom_page_id: page.id,
          lang_code: language.toLowerCase(),
        },
        select: { name: true, content: true },
      });

    return {
      status: 'success',
      data: {
        id: page.id.toString(),
        slug: page.slug,
        name: translation?.name ?? null,
        content: translation?.content ?? null,
      },
    };
  }
}
