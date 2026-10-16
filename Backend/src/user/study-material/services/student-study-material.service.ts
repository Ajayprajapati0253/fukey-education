
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentStudyMaterialService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeId(value: bigint | number | string): string {
    return value.toString();
  }

  private validateId(value: string, field: string): bigint {
    if (!value || !/^\d+$/.test(value)) {
      throw new BadRequestException(`Invalid ${field}`);
    }

    return BigInt(value);
  }

  /**
   * GET /user/study-material/classes
   * Active top-level classes with English translations.
   */
  async getClasses() {
    const classes = await this.prisma.course_categories.findMany({
      where: {
        parent_id: null,
        status: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (classes.length === 0) {
      return [];
    }

    const translations =
      await this.prisma.course_category_translations.findMany({
        where: {
          course_category_id: {
            in: classes.map((item) => item.id),
          },
          lang_code: 'en',
        },
      });

    const nameMap = new Map(
      translations.map((item) => [
        item.course_category_id.toString(),
        item.name,
      ]),
    );

    return classes.map((item) => ({
      id: this.serializeId(item.id),
      slug: item.slug,
      name: nameMap.get(item.id.toString()) ?? item.slug,
    }));
  }

  /**
   * GET /user/study-material/subjects?class=class-10
   * Active subjects under the selected class.
   */
  async getSubjects(classSlug: string) {
    if (!classSlug?.trim()) {
      throw new BadRequestException('Class slug is required');
    }

    const selectedClass = await this.prisma.course_categories.findFirst({
      where: {
        slug: classSlug.trim(),
        parent_id: null,
        status: true,
      },
    });

    if (!selectedClass) {
      throw new NotFoundException('Class not found');
    }

    const subjects = await this.prisma.course_categories.findMany({
      where: {
        parent_id: selectedClass.id,
        status: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (subjects.length === 0) {
      return [];
    }

    const translations =
      await this.prisma.course_category_translations.findMany({
        where: {
          course_category_id: {
            in: subjects.map((item) => item.id),
          },
          lang_code: 'en',
        },
      });

    const nameMap = new Map(
      translations.map((item) => [
        item.course_category_id.toString(),
        item.name,
      ]),
    );

    return subjects.map((item) => ({
      id: this.serializeId(item.id),
      slug: item.slug,
      name: nameMap.get(item.id.toString()) ?? item.slug,
    }));
  }

  /**
   * GET /user/study-material?subject=maths&language=en&type=notes
   *
   * If type is omitted, returns all material types.
   */
  async getMaterials(
    subjectSlug: string,
    language: string,
    userId: string | number | bigint | null,
    type?: string,
  ) {
    if (!subjectSlug?.trim()) {
      throw new BadRequestException('Subject slug is required');
    }

    if (!['en', 'hi'].includes(language)) {
      throw new BadRequestException('Language must be en or hi');
    }

    const subject = await this.prisma.course_categories.findFirst({
      where: {
        slug: subjectSlug.trim(),
        status: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (type?.trim() && type.trim().length > 50) {
      throw new BadRequestException('Invalid material type');
    }

    const materials = await this.prisma.notes.findMany({
      where: {
        subject_category_id: subject.id,
        language,
        status: true,
        ...(type?.trim() ? { type: type.trim() } : {}),
      },
      orderBy: {
        id: 'desc',
      },
    });

    const purchasedNoteIds = new Set<string>();

    if (userId !== null && userId !== undefined) {
      const uid = this.validateId(String(userId), 'user ID');

      const paidMaterialIds = materials
        .filter((item) => item.is_paid)
        .map((item) => item.id);

      if (paidMaterialIds.length > 0) {
        const purchases = await this.prisma.note_purchases.findMany({
          where: {
            user_id: uid,
            note_id: {
              in: paidMaterialIds,
            },
          },
          select: {
            note_id: true,
          },
        });

        for (const purchase of purchases) {
          purchasedNoteIds.add(purchase.note_id.toString());
        }
      }
    }

    return materials.map((item) => {
      const purchased = purchasedNoteIds.has(item.id.toString());
      const unlocked = !item.is_paid || purchased;

      return {
        id: this.serializeId(item.id),
        title: item.title,
        type: item.type,
        language: item.language,
        description: item.description,
        is_paid: Boolean(item.is_paid),
        price: item.price,
        locked: !unlocked,
        pdf_url: unlocked ? item.pdf_path : null,
        video_url: unlocked ? item.video_url : null,
      };
    });
  }

  /**
   * GET /user/study-material/:id
   */
  async getMaterialById(
    id: bigint,
    userId: string | number | bigint | null,
  ) {
    const material = await this.prisma.notes.findFirst({
      where: {
        id,
        status: true,
      },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    let purchased = false;

    if (userId !== null && userId !== undefined) {
      const uid = this.validateId(String(userId), 'user ID');

      const purchase = await this.prisma.note_purchases.findFirst({
        where: {
          user_id: uid,
          note_id: material.id,
        },
        select: {
          id: true,
        },
      });

      purchased = Boolean(purchase);
    }

    const unlocked = !material.is_paid || purchased;

    if (!unlocked) {
      throw new ForbiddenException({
        message: 'This study material is paid',
        locked: true,
      });
    }

    return {
      id: this.serializeId(material.id),
      title: material.title,
      type: material.type,
      language: material.language,
      description: material.description,
      is_paid: Boolean(material.is_paid),
      price: material.price,
      locked: false,
      pdf_url: material.pdf_path,
      video_url: material.video_url,
    };
  }
}
