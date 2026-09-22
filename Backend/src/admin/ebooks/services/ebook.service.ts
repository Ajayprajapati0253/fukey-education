import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { UpdateEbookDto } from '../dto/update-ebook.dto';

@Injectable()
export class EbookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all ebooks
   *
   * Laravel:
   * Ebook::orderByRaw(
   *   "CAST(REGEXP_SUBSTR(title, '[0-9]+') AS UNSIGNED) ASC"
   * )->paginate(20);
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [ebooks, total] = await Promise.all([
      this.prisma.ebooks.findMany({
        skip,
        take: limit,
        orderBy: {
          title: 'asc',
        },
        include: {
          course_categories: true,
          courses: true,
        },
      }),
      this.prisma.ebooks.count(),
    ]);

    return {
      data: ebooks.map((ebook) => this.serializeEbook(ebook)),
      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single ebook
   *
   * Laravel:
   * Ebook::findOrFail($id)
   */
  async findOne(id: string) {
    const ebookId = this.toBigInt(id);

    const ebook = await this.prisma.ebooks.findUnique({
      where: {
        id: ebookId,
      },
      include: {
        course_categories: true,
        courses: true,
      },
    });

    if (!ebook) {
      throw new NotFoundException('Ebook not found');
    }

    return this.serializeEbook(ebook);
  }

  /**
   * Create ebook
   */
  async create(dto: CreateEbookDto) {
    const categoryId = this.toBigInt(dto.category_id);

    // Laravel:
    // category_id => required|exists:course_categories,id
    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    // Laravel:
    // title => required|max:255|unique:ebooks,title
    const existingTitle = await this.prisma.ebooks.findFirst({
      where: {
        title: dto.title,
      },
    });

    if (existingTitle) {
      throw new ConflictException('Ebook title already exists');
    }

    // Validate course if provided
    let courseId: bigint | null = null;

    if (dto.course_id) {
      courseId = this.toBigInt(dto.course_id);

      const course = await this.prisma.courses.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new BadRequestException('Invalid course');
      }
    }

    // Laravel:
    // if (!str_starts_with($pdfUrl, 'https://fukey.in/uploads/'))
    //     abort(403, 'Invalid PDF source');
    const pdfUrl = dto.pdf_url.trim();

    this.validatePdfUrl(pdfUrl);

    // Laravel:
    // Ebook::isSubSubjectApplicable($request->category_id)
    const subSubjectApplicable =
      await this.isSubSubjectApplicable(categoryId);

    let subSubject: string | null = null;

    if (subSubjectApplicable) {
      if (!dto.sub_subject) {
        throw new BadRequestException(
          'Sub Subject is required for Class 9/10 Science ebooks.',
        );
      }

      subSubject = dto.sub_subject;
    }

    // Laravel:
    // Str::slug($request->title) . '-' . Str::random(6)
    const slug = await this.generateUniqueSlug(dto.title);

    const ebook = await this.prisma.ebooks.create({
      data: {
        category_id: categoryId,
        course_id: courseId,
        title: dto.title,
        slug,
        language: 'en',
        description: dto.description ?? null,
        pdf_path: pdfUrl,
        cover_image: dto.cover_image ?? null,
        sub_subject: subSubject,
      },
      include: {
        course_categories: true,
        courses: true,
      },
    });

    return {
      success: true,
      message: 'Ebook added successfully!',
      data: this.serializeEbook(ebook),
    };
  }

  /**
   * Update ebook
   */
  async update(id: string, dto: UpdateEbookDto) {
    const ebookId = this.toBigInt(id);

    const ebook = await this.prisma.ebooks.findUnique({
      where: {
        id: ebookId,
      },
    });

    if (!ebook) {
      throw new NotFoundException('Ebook not found');
    }

    const categoryId = this.toBigInt(dto.category_id);

    // Validate category
    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    // Laravel:
    // unique:ebooks,title,' . $ebook->id
    const existingTitle = await this.prisma.ebooks.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id: ebookId,
        },
      },
    });

    if (existingTitle) {
      throw new ConflictException('Ebook title already exists');
    }

    // Validate course
    let courseId: bigint | null = null;

    if (dto.course_id) {
      courseId = this.toBigInt(dto.course_id);

      const course = await this.prisma.courses.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new BadRequestException('Invalid course');
      }
    }

    const pdfUrl = dto.pdf_url.trim();

    this.validatePdfUrl(pdfUrl);

    const subSubjectApplicable =
      await this.isSubSubjectApplicable(categoryId);

    let subSubject: string | null = null;

    if (subSubjectApplicable) {
      if (!dto.sub_subject) {
        throw new BadRequestException(
          'Sub Subject is required for Class 9/10 Science ebooks.',
        );
      }

      subSubject = dto.sub_subject;
    }

    const slug = await this.generateUniqueSlug(dto.title, ebookId);

    const updatedEbook = await this.prisma.ebooks.update({
      where: {
        id: ebookId,
      },
      data: {
        category_id: categoryId,
        course_id: courseId,
        title: dto.title,
        slug,
        language: dto.language,
        description: dto.description ?? null,
        pdf_path: pdfUrl,
        cover_image: dto.cover_image ?? ebook.cover_image,
        sub_subject: subSubject,
      },
      include: {
        course_categories: true,
        courses: true,
      },
    });

    return {
      success: true,
      message: 'Ebook updated successfully!',
      data: this.serializeEbook(updatedEbook),
    };
  }

  /**
   * Delete ebook
   *
   * Laravel:
   * Storage::disk('public')->delete($ebook->cover_image);
   * Storage::disk('public')->delete($ebook->pdf_path);
   * $ebook->delete();
   */
  async remove(id: string) {
    const ebookId = this.toBigInt(id);

    const ebook = await this.prisma.ebooks.findUnique({
      where: {
        id: ebookId,
      },
    });

    if (!ebook) {
      throw new NotFoundException('Ebook not found');
    }

    /*
     * IMPORTANT:
     *
     * Laravel deletes the physical files here.
     * We are NOT deleting files yet because the existing
     * NestJS storage/S3 interface has not been confirmed.
     *
     * Database deletion is kept separate.
     */

    await this.prisma.ebooks.delete({
      where: {
        id: ebookId,
      },
    });

    return {
      success: true,
      message: 'Ebook deleted successfully!',
    };
  }

  /**
   * Check whether sub_subject is required.
   *
   * Laravel:
   *
   * public static function isSubSubjectApplicable(?int $categoryId): bool
   *
   * Eligible parent:
   *   Class 9
   *   Class 10
   *
   * Eligible subject:
   *   Science*
   */
  private async isSubSubjectApplicable(
    categoryId: bigint,
  ): Promise<boolean> {
    const subCategory =
      await this.prisma.course_categories.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!subCategory) {
      return false;
    }

    if (!subCategory.parent_id) {
      return false;
    }

    const subjectTranslation =
      await this.prisma.course_category_translations.findFirst({
        where: {
          course_category_id: categoryId,
        },
      });

    const parentCategory =
      await this.prisma.course_categories.findUnique({
        where: {
          id: subCategory.parent_id,
        },
      });

    if (!parentCategory) {
      return false;
    }

    const parentTranslation =
      await this.prisma.course_category_translations.findFirst({
        where: {
          course_category_id: parentCategory.id,
        },
      });

    const subjectName = subjectTranslation?.name ?? '';
    const parentName = parentTranslation?.name ?? '';

    return (
      ['Class 9', 'Class 10'].includes(parentName) &&
      subjectName.trim().startsWith('Science')
    );
  }

  /**
   * Generate Laravel-style slug:
   *
   * Str::slug($title) . '-' . Str::random(6)
   */
  private async generateUniqueSlug(
    title: string,
    excludeId?: bigint,
  ): Promise<string> {
    const baseSlug = this.slugify(title);

    for (let i = 0; i < 20; i++) {
      const random = Math.random()
        .toString(36)
        .substring(2, 8);

      const slug = `${baseSlug}-${random}`;

      const existing = await this.prisma.ebooks.findUnique({
        where: {
          slug,
        },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
    }

    throw new ConflictException(
      'Unable to generate unique ebook slug',
    );
  }

  /**
   * Basic Laravel-like Str::slug()
   */
  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validate PDF URL
   */
  private validatePdfUrl(url: string) {
    if (!url.startsWith('https://fukey.in/uploads/')) {
      throw new ForbiddenException('Invalid PDF source');
    }
  }

  /**
   * Convert request ID to BigInt safely
   */
  private toBigInt(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException('Invalid ID');
    }
  }

  /**
   * Convert BigInt values to JSON-safe values.
   */
  private serializeEbook(ebook: any) {
    return {
      ...ebook,
      id: ebook.id?.toString(),
      category_id: ebook.category_id?.toString() ?? null,
      course_id: ebook.course_id?.toString() ?? null,
      course_categories: ebook.course_categories
        ? {
            ...ebook.course_categories,
            id: ebook.course_categories.id?.toString(),
            parent_id:
              ebook.course_categories.parent_id?.toString() ?? null,
          }
        : null,
      courses: ebook.courses
        ? {
            ...ebook.courses,
            id: ebook.courses.id?.toString(),
            instructor_id:
              ebook.courses.instructor_id?.toString(),
            category_id:
              ebook.courses.category_id?.toString() ?? null,
          }
        : null,
    };
  }

  async getCoursesByCategory(categoryId: string) {
  const categoryIdBigInt = this.toBigInt(categoryId);

  const courses = await this.prisma.courses.findMany({
    where: {
      category_id: categoryIdBigInt,
    },
    orderBy: {
      title: 'asc',
    },
  });

  if (courses.length === 0) {
    return {
      courses: [],
    };
  }

  const courseIds = courses.map((course) => course.id);

  const selectedLanguages =
    await this.prisma.course_selected_languages.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
      },
    });

  const languageIds = [
    ...new Set(
      selectedLanguages.map((item) =>
        item.language_id.toString(),
      ),
    ),
  ].map((id) => BigInt(id));

  const languages =
    languageIds.length > 0
      ? await this.prisma.course_languages.findMany({
          where: {
            id: {
              in: languageIds,
            },
          },
        })
      : [];

  const languageMap = new Map(
    languages.map((language) => [
      language.id.toString(),
      language,
    ]),
  );

  const result = courses.map((course) => {
    const courseLanguages = selectedLanguages
      .filter(
        (selected) =>
          selected.course_id.toString() ===
          course.id.toString(),
      )
      .map((selected) => {
        const language = languageMap.get(
          selected.language_id.toString(),
        );

        return {
          id: selected.id.toString(),
          course_id: selected.course_id.toString(),
          language_id: selected.language_id.toString(),
          language: language
            ? {
                id: language.id.toString(),
                name: language.name,
                status: language.status,
              }
            : null,
        };
      });

    return {
      ...this.serializeEbookCourse(course),
      languages: courseLanguages,
    };
  });

  return {
    courses: result,
  };
}

private serializeEbookCourse(course: any) {
  return {
    ...course,
    id: course.id?.toString(),
    instructor_id: course.instructor_id?.toString(),
    category_id: course.category_id?.toString() ?? null,
  };
}
}