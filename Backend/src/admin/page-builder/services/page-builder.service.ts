
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';

@Injectable()
export class PageBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  private serializePage(page: any, translations: any[] = []) {
    return {
      id: page.id.toString(),
      slug: page.slug,
      status: page.status,
      created_at: page.created_at,
      updated_at: page.updated_at,
      translations: translations.map((translation) => ({
        id: translation.id.toString(),
        custom_page_id: translation.custom_page_id.toString(),
        lang_code: translation.lang_code,
        name: translation.name,
        content: translation.content,
        created_at: translation.created_at,
        updated_at: translation.updated_at,
      })),
    };
  }

  private async getTranslations(pageId: bigint) {
    return this.prisma.custom_page_translations.findMany({
      where: { custom_page_id: pageId },
      orderBy: { id: 'asc' },
    });
  }

  private async findPageOrFail(id: bigint) {
    const page = await this.prisma.custom_pages.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  private async validateTranslations(
    translations: { lang_code: string; name?: string; content?: string }[],
  ) {
    const seen = new Set<string>();

    for (const translation of translations) {
      const code = translation.lang_code.trim();

      if (!code) {
        throw new BadRequestException(
          'Translation language code is required.',
        );
      }

      if (seen.has(code)) {
        throw new BadRequestException(
          `Duplicate translation language: ${code}`,
        );
      }

      seen.add(code);

      const language = await this.prisma.languages.findFirst({
        where: { code },
        select: { id: true },
      });

      if (!language) {
        throw new BadRequestException(
          `Language '${code}' does not exist.`,
        );
      }
    }
  }

  private async saveTranslations(
    tx: any,
    pageId: bigint,
    translations: {
      lang_code: string;
      name?: string;
      content?: string;
    }[],
  ) {
    for (const translation of translations) {
      const langCode = translation.lang_code.trim();

      const existing =
        await tx.custom_page_translations.findFirst({
          where: {
            custom_page_id: pageId,
            lang_code: langCode,
          },
          select: { id: true },
        });

      const data = {
        name: translation.name ?? null,
        content: translation.content ?? null,
        updated_at: new Date(),
      };

      if (existing) {
        await tx.custom_page_translations.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await tx.custom_page_translations.create({
          data: {
            custom_page_id: pageId,
            lang_code: langCode,
            ...data,
            created_at: new Date(),
          },
        });
      }
    }
  }

  async findAll(page = 1, limit = 15) {
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(
      100,
      Math.max(1, Number(limit) || 15),
    );

    const skip = (currentPage - 1) * perPage;

    const [pages, total] = await Promise.all([
      this.prisma.custom_pages.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      this.prisma.custom_pages.count(),
    ]);

    const data = await Promise.all(
      pages.map(async (page) =>
        this.serializePage(
          page,
          await this.getTranslations(page.id),
        ),
      ),
    );

    return {
      data,
      meta: {
        current_page: currentPage,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid page ID');
    }

    const pageId = BigInt(id);
    const page = await this.findPageOrFail(pageId);
    const translations = await this.getTranslations(pageId);

    return {
      data: this.serializePage(page, translations),
    };
  }

  async create(dto: CreatePageDto) {
    const slug = dto.slug.trim();

    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    const existing = await this.prisma.custom_pages.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('The slug has already been taken.');
    }

    await this.validateTranslations(dto.translations ?? []);

    const now = new Date();

    try {
      const page = await this.prisma.$transaction(async (tx) => {
        const created = await tx.custom_pages.create({
          data: {
            slug,
            status: dto.status ?? true,
            created_at: now,
            updated_at: now,
          },
        });

        await this.saveTranslations(
          tx,
          created.id,
          dto.translations ?? [],
        );

        return created;
      });

      return {
        status: 'success',
        message: 'Page created successfully.',
        data: this.serializePage(
          page,
          await this.getTranslations(page.id),
        ),
      };
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('The slug has already been taken.');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePageDto) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid page ID');
    }

    const pageId = BigInt(id);
    await this.findPageOrFail(pageId);

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim();

      if (!slug) {
        throw new BadRequestException('Slug cannot be empty');
      }

      const duplicate = await this.prisma.custom_pages.findFirst({
        where: {
          slug,
          id: { not: pageId },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException('The slug has already been taken.');
      }
    }

    if (dto.translations !== undefined) {
      await this.validateTranslations(dto.translations);
    }

    await this.prisma.$transaction(async (tx) => {
      const data: {
        slug?: string;
        status?: boolean;
        updated_at: Date;
      } = { updated_at: new Date() };

      if (dto.slug !== undefined) data.slug = dto.slug.trim();
      if (dto.status !== undefined) data.status = dto.status;

      await tx.custom_pages.update({
        where: { id: pageId },
        data,
      });

      if (dto.translations !== undefined) {
        await this.saveTranslations(
          tx,
          pageId,
          dto.translations,
        );
      }
    });

    const updated = await this.findPageOrFail(pageId);

    return {
      status: 'success',
      message: 'Page updated successfully.',
      data: this.serializePage(
        updated,
        await this.getTranslations(pageId),
      ),
    };
  }

  async remove(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid page ID');
    }

    const pageId = BigInt(id);
    await this.findPageOrFail(pageId);

    await this.prisma.$transaction(async (tx) => {
      await tx.custom_page_translations.deleteMany({
        where: { custom_page_id: pageId },
      });

      await tx.custom_pages.delete({
        where: { id: pageId },
      });
    });

    return {
      status: 'success',
      message: 'Page deleted successfully.',
    };
  }

  async toggleStatus(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid page ID');
    }

    const pageId = BigInt(id);
    const page = await this.findPageOrFail(pageId);

    const updated = await this.prisma.custom_pages.update({
      where: { id: pageId },
      data: {
        status: !page.status,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
      data: {
        id: updated.id.toString(),
        status: updated.status,
      },
    };
  }
}
