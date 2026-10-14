
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudyMaterialDto } from '../dto/create-study-material.dto';
import { UpdateStudyMaterialDto } from '../dto/update-study-material.dto';
import { unlinkSync, existsSync } from 'fs';
import { basename, extname, join } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class StudyMaterialService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly materialTypes = [
    'notes',
    'video',
    'practice_questions',
    'formula_sheet',
    'mcq',
    'important_questions',
    'sample_paper',
    'test_series',
    'question_bank',
  ];

  private serialize(note: any) {
    return {
      ...note,
      id: note.id.toString(),
      class_category_id: note.class_category_id.toString(),
      subject_category_id: note.subject_category_id.toString(),
    };
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    type?: string;
    class_category_id?: string;
    subject_category_id?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    if (query.type && !this.materialTypes.includes(query.type)) {
      throw new BadRequestException('Invalid study material type');
    }

    const where: any = {};

    if (query.type) where.type = query.type;

    if (query.class_category_id) {
      if (!/^\d+$/.test(query.class_category_id)) {
        throw new BadRequestException('Invalid class_category_id');
      }
      where.class_category_id = BigInt(query.class_category_id);
    }

    if (query.subject_category_id) {
      if (!/^\d+$/.test(query.subject_category_id)) {
        throw new BadRequestException('Invalid subject_category_id');
      }
      where.subject_category_id = BigInt(query.subject_category_id);
    }

    if (query.search?.trim()) {
      where.title = {
        contains: query.search.trim(),
      };
    }

    const [materials, total] = await Promise.all([
      this.prisma.notes.findMany({
        where,
        include: {
          course_categories_notes_class_category_idTocourse_categories: true,
          course_categories_notes_subject_category_idTocourse_categories: true,
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notes.count({ where }),
    ]);

    return {
      data: materials.map((material) => this.serialize(material)),
      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid study material ID');
    }

    const material = await this.prisma.notes.findUnique({
      where: { id: BigInt(id) },
      include: {
        course_categories_notes_class_category_idTocourse_categories: true,
        course_categories_notes_subject_category_idTocourse_categories: true,
      },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    return this.serialize(material);
  }

  

async create(dto: CreateStudyMaterialDto) {
  const classId = BigInt(dto.class_category_id);
  const subjectId = BigInt(dto.subject_category_id);

  const [classCategory, subjectCategory] = await Promise.all([
    this.prisma.course_categories.findUnique({
      where: { id: classId },
    }),
    this.prisma.course_categories.findUnique({
      where: { id: subjectId },
    }),
  ]);

  if (!classCategory || !subjectCategory) {
    throw new BadRequestException('Invalid class or subject category');
  }

  if (subjectCategory.parent_id !== classId) {
    throw new BadRequestException(
      'Selected subject does not belong to the selected class',
    );
  }

  const pdfTypes = [
    'notes',
    'practice_questions',
    'formula_sheet',
    'important_questions',
    'sample_paper',
    'question_bank',
  ];

  if (pdfTypes.includes(dto.type) && !dto.pdf_path) {
    throw new BadRequestException('PDF path is required');
  }

  if (dto.type === 'video' && !dto.video_url) {
    throw new BadRequestException('Video URL is required');
  }

  return this.prisma.$transaction(async (tx) => {
    const material = await tx.notes.create({
      data: {
        title: dto.title.trim(),
        type: dto.type,
        class_category_id: classId,
        subject_category_id: subjectId,
        language: dto.language,
        description: dto.description ?? null,
        pdf_path: dto.pdf_path ?? null,
        video_url: dto.type === 'video' ? dto.video_url : null,
        is_paid: dto.is_paid,
        price: dto.is_paid ? dto.price ?? 0 : 0,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (dto.type === 'mcq') {
      await this.syncMcqTest(tx, material, dto);
    }

    return this.serialize(material);
  });
}




async update(id: string, dto: UpdateStudyMaterialDto) {
  if (!/^\d+$/.test(id)) {
    throw new BadRequestException('Invalid study material ID');
  }

  const materialId = BigInt(id);

  const existing = await this.prisma.notes.findUnique({
    where: { id: materialId },
  });

  if (!existing) {
    throw new NotFoundException('Study material not found');
  }

  const classId =
    dto.class_category_id !== undefined
      ? BigInt(dto.class_category_id)
      : existing.class_category_id;

  const subjectId =
    dto.subject_category_id !== undefined
      ? BigInt(dto.subject_category_id)
      : existing.subject_category_id;

  const type = dto.type ?? existing.type;
  const title = dto.title?.trim() ?? existing.title;

  const pdfPath =
    dto.pdf_path !== undefined ? dto.pdf_path : existing.pdf_path;

  const videoUrl =
    dto.video_url !== undefined ? dto.video_url : existing.video_url;

  const [classCategory, subjectCategory] = await Promise.all([
    this.prisma.course_categories.findUnique({
      where: { id: classId },
    }),
    this.prisma.course_categories.findUnique({
      where: { id: subjectId },
    }),
  ]);

  if (!classCategory) {
    throw new BadRequestException('Invalid class category');
  }

  if (!subjectCategory) {
    throw new BadRequestException('Invalid subject category');
  }

  if (subjectCategory.parent_id !== classId) {
    throw new BadRequestException(
      'Subject category does not belong to the selected class',
    );
  }

  const pdfTypes = [
    'notes',
    'practice_questions',
    'formula_sheet',
    'important_questions',
    'sample_paper',
    'question_bank',
  ];

  if (pdfTypes.includes(type) && !pdfPath) {
    throw new BadRequestException(
      'PDF path is required for this study material type',
    );
  }

  if (type === 'video' && !videoUrl) {
    throw new BadRequestException(
      'Video URL is required for video study material',
    );
  }

  const duplicate = await this.prisma.notes.findFirst({
    where: {
      title,
      type,
      id: { not: materialId },
    },
  });

  if (duplicate) {
    throw new BadRequestException(
      'This title already exists for the selected material type',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.notes.update({
      where: { id: materialId },
      data: {
        title,
        class_category_id: classId,
        subject_category_id: subjectId,
        type,
        ...(dto.language !== undefined && {
          language: dto.language,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.pdf_path !== undefined && {
          pdf_path: dto.pdf_path,
        }),
        ...(dto.video_url !== undefined && {
          video_url: dto.video_url,
        }),
        ...(dto.is_paid !== undefined && {
          is_paid: dto.is_paid,
        }),
        ...(dto.price !== undefined && {
          price: dto.price,
        }),
        updated_at: new Date(),
      },
    });

    if (type === 'mcq') {
      const existingTest = await tx.tests.findFirst({
        where: {
          note_id: materialId,
          test_type: 'mcq',
        },
        orderBy: { id: 'desc' },
        select: { id: true },
      });

      await this.syncMcqTest(
        tx,
        updated,
        dto,
        existingTest?.id,
      );
    }

    return this.serialize(updated);
  });
}




async remove(id: string) {
  if (!/^\d+$/.test(id)) {
    throw new BadRequestException('Invalid study material ID');
  }

  const material = await this.prisma.notes.findUnique({
    where: { id: BigInt(id) },
  });

  if (!material) {
    throw new NotFoundException('Study material not found');
  }

  await this.prisma.notes.delete({
    where: { id: BigInt(id) },
  });

  return {
    message: 'Study material deleted successfully',
  };
}


private async syncMcqTest(
  tx: any,
  note: any,
  dto: CreateStudyMaterialDto | UpdateStudyMaterialDto,
  existingTestId?: bigint,
) {
  const testTitle =
    dto.online_test_title?.trim() || note.title;

  const duration = dto.online_test_duration ?? 30;
  const requestedCount = dto.online_test_questions ?? 10;
  const marks = dto.online_test_marks ?? 1;
  const negativeMarks = dto.online_test_negative_marks ?? 0;
  const mode = dto.online_test_question_mode ?? 'manual';

  const existingMappings = existingTestId
    ? await tx.test_questions.findMany({
        where: { test_id: existingTestId },
        orderBy: { question_order: 'asc' },
      })
    : [];

  const questionSettingsChanged =
    !existingTestId ||
    dto.online_test_question_mode !== undefined ||
    dto.online_test_question_ids !== undefined ||
    dto.online_test_questions !== undefined ||
    dto.online_test_marks !== undefined ||
    dto.online_test_negative_marks !== undefined;

  let selectedIds: bigint[] = [];

  if (!questionSettingsChanged && existingMappings.length) {
    selectedIds = existingMappings.map(
      (mapping: any) => mapping.question_id,
    );
  } else {
    const ids = [
      ...new Set(
        (dto.online_test_question_ids ?? []).map(Number),
      ),
    ];

    if (mode === 'manual' && ids.length === 0) {
      throw new BadRequestException(
        'Please select at least one question.',
      );
    }

    const eligibleQuestions = await tx.questions.findMany({
      where: {
        class_id: BigInt(note.class_category_id),
        subject_id: BigInt(note.subject_category_id),
        status: true,
        question_type: 'mcq_single',
        ...(mode === 'manual'
          ? { id: { in: ids.map((id) => BigInt(id)) } }
          : {}),
      },
      select: { id: true },
    });

    if (mode === 'manual') {
      if (eligibleQuestions.length !== ids.length) {
        throw new BadRequestException(
          'One or more selected questions are invalid, inactive, or belong to another class or subject.',
        );
      }

      selectedIds = eligibleQuestions.map((q: any) => q.id);
    } else {
      const shuffled = [...eligibleQuestions];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      selectedIds = shuffled
        .slice(0, requestedCount)
        .map((q: any) => q.id);
    }
  }

  if (!selectedIds.length) {
    throw new BadRequestException(
      'No eligible MCQ questions found.',
    );
  }

  const selectedQuestions = await tx.questions.findMany({
    where: {
      id: { in: selectedIds },
      class_id: BigInt(note.class_category_id),
      subject_id: BigInt(note.subject_category_id),
      status: true,
      question_type: 'mcq_single',
    },
    select: { id: true },
  });

  if (selectedQuestions.length !== selectedIds.length) {
    throw new BadRequestException(
      'Selected MCQ questions are no longer eligible for this test.',
    );
  }

  let slugBase =
    testTitle
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'mcq-test';

  let slug = slugBase;
  let suffix = 1;

  while (true) {
    const duplicate = await tx.tests.findFirst({
      where: {
        slug,
        ...(existingTestId
          ? { id: { not: existingTestId } }
          : {}),
      },
      select: { id: true },
    });

    if (!duplicate) break;

    slug = `${slugBase}-${suffix++}`;
  }

  const effectiveMarks =
    !questionSettingsChanged && existingMappings.length
      ? Number(existingMappings[0].marks ?? marks)
      : marks;

  const effectiveNegativeMarks =
    !questionSettingsChanged && existingMappings.length
      ? Number(existingMappings[0].negative_marks ?? negativeMarks)
      : negativeMarks;

  const testData = {
    note_id: BigInt(note.id),
    class_id: BigInt(note.class_category_id),
    subject_id: BigInt(note.subject_category_id),
    chapter_id: null,
    title: testTitle,
    slug,
    description: note.description ?? null,
    test_type: 'mcq',
    duration_minutes: duration,
    total_questions: selectedIds.length,
    total_marks: Number(
      (selectedIds.length * effectiveMarks).toFixed(2),
    ),
    is_paid: Boolean(note.is_paid),
    price: note.is_paid ? Number(note.price) : 0,
    status: true,
    updated_at: new Date(),
  };

  const test = existingTestId
    ? await tx.tests.update({
        where: { id: existingTestId },
        data: testData,
      })
    : await tx.tests.create({
        data: {
          ...testData,
          created_at: new Date(),
        },
      });

  if (questionSettingsChanged || !existingMappings.length) {
    await tx.test_questions.deleteMany({
      where: { test_id: test.id },
    });

    await tx.test_questions.createMany({
      data: selectedIds.map((questionId, index) => ({
        test_id: test.id,
        question_id: questionId,
        question_order: index + 1,
        marks: effectiveMarks,
        negative_marks: effectiveNegativeMarks,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });
  }

  return test;
}


private readonly pdfTypes = [
  'notes',
  'practice_questions',
  'formula_sheet',
  'mcq',
  'important_questions',
  'sample_paper',
  'test_series',
  'question_bank',
];

private removeUploadedFiles(files: Express.Multer.File[]) {
  for (const file of files) {
    if (file?.path && existsSync(file.path)) {
      try {
        unlinkSync(file.path);
      } catch {
        // Preserve the original error if cleanup fails.
      }
    }
  }
}

private async validateUploadData(body: any) {
  const classIdText = String(body.class_category_id ?? '');
  const subjectIdText = String(body.subject_category_id ?? '');

  if (!/^\d+$/.test(classIdText) || !/^\d+$/.test(subjectIdText)) {
    throw new BadRequestException(
      'Valid class_category_id and subject_category_id are required',
    );
  }

  const classId = BigInt(classIdText);
  const subjectId = BigInt(subjectIdText);

  const [classCategory, subjectCategory] = await Promise.all([
    this.prisma.course_categories.findUnique({
      where: { id: classId },
    }),
    this.prisma.course_categories.findUnique({
      where: { id: subjectId },
    }),
  ]);

  if (!classCategory || !subjectCategory) {
    throw new BadRequestException('Invalid class or subject category');
  }

  if (subjectCategory.parent_id !== classId) {
    throw new BadRequestException(
      'Selected subject does not belong to the selected class',
    );
  }

  const type = String(body.type ?? '');
  if (!this.pdfTypes.includes(type)) {
    throw new BadRequestException('Invalid PDF study material type');
  }

  const language = String(body.language ?? '').toLowerCase();
  if (!['en', 'hi'].includes(language)) {
    throw new BadRequestException('Language must be en or hi');
  }

  const paidValue = String(body.is_paid ?? '');
  if (!['true', 'false', '1', '0'].includes(paidValue)) {
    throw new BadRequestException('is_paid must be a boolean');
  }

  const isPaid = ['true', '1'].includes(paidValue);
  const price = Number(body.price ?? 0);

  if (isPaid && (!Number.isFinite(price) || price < 0)) {
    throw new BadRequestException(
      'A valid non-negative price is required for paid materials',
    );
  }

  return {
    classId,
    subjectId,
    type,
    language,
    isPaid,
    price: isPaid ? price : 0,
    description: body.description
      ? String(body.description)
      : null,
  };
}

private getUploadTitle(originalName: string) {
  const withoutExtension = basename(
    originalName,
    extname(originalName),
  );

  return (
    withoutExtension
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled PDF'
  );
}

private async getUniqueTitle(
  tx: any,
  baseTitle: string,
  type: string,
  reservedTitles: Set<string>,
) {
  let title = baseTitle;
  let suffix = 2;

  while (true) {
    const key = title.toLowerCase();

    const existsInBatch = reservedTitles.has(key);
    const existsInDatabase = await tx.notes.findFirst({
      where: { title, type },
      select: { id: true },
    });

    if (!existsInBatch && !existsInDatabase) {
      reservedTitles.add(key);
      return title;
    }

    title = `${baseTitle} (${suffix++})`;
  }
}

async uploadSingle(
  file: Express.Multer.File,
  body: CreateStudyMaterialDto,
) {
  if (!file) {
    throw new BadRequestException('PDF file is required');
  }

  try {
    const data = await this.validateUploadData(body);

    const material = await this.prisma.$transaction(async (tx) => {
      const title = await this.getUniqueTitle(
        tx,
        this.getUploadTitle(file.originalname),
        data.type,
        new Set<string>(),
      );

      return tx.notes.create({
        data: {
          title,
          class_category_id: data.classId,
          subject_category_id: data.subjectId,
          type: data.type,
          language: data.language,
          description: data.description,
          pdf_path: `/uploads/notes/${basename(file.filename)}`,
          video_url: null,
          is_paid: data.isPaid,
          price: data.price,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    });

    return {
      message: 'Study material uploaded successfully',
      data: this.serialize(material),
    };
  } catch (error) {
    this.removeUploadedFiles([file]);
    throw error;
  }
}

async uploadBulk(
  files: Express.Multer.File[],
  body: CreateStudyMaterialDto,
) {
  if (!files?.length) {
    throw new BadRequestException(
      'At least one PDF file is required',
    );
  }

  if (files.length > 50) {
    this.removeUploadedFiles(files);
    throw new BadRequestException(
      'You can upload a maximum of 50 PDFs at a time',
    );
  }

  try {
    const data = await this.validateUploadData(body);

    const materials = await this.prisma.$transaction(async (tx) => {
      const created: any[] = [];
      const reservedTitles = new Set<string>();

      for (const file of files) {
        const baseTitle = this.getUploadTitle(file.originalname);

        const title = await this.getUniqueTitle(
          tx,
          baseTitle,
          data.type,
          reservedTitles,
        );

        const material = await tx.notes.create({
          data: {
            title,
            class_category_id: data.classId,
            subject_category_id: data.subjectId,
            type: data.type,
            language: data.language,
            description: data.description,
            pdf_path: `/uploads/notes/${basename(file.filename)}`,
            video_url: null,
            is_paid: data.isPaid,
            price: data.price,
            status: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        created.push(this.serialize(material));
      }

      return created;
    });

    return {
      message: `${materials.length} study material(s) created successfully from PDFs`,
      count: materials.length,
      data: materials,
    };
  } catch (error) {
    this.removeUploadedFiles(files);
    throw error;
  }
}


}
