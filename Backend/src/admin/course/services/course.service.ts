import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { courses_status, courses_is_approved } from '@prisma/client';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateCourseChapterDto } from '../dto/create-course-chapter.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

async findAll(
  keyword?: string,
  category?: string,
  date?: string,
  approveStatus?: string,
  status?: string,
  instructor?: string,
  page = 1,
  limit = 15,
  orderBy?: string,
) {
  const where: any = {};

  if (keyword) {
    where.title = {
      contains: keyword,
    };
  }

  if (category) {
    where.category_id = BigInt(category);
  }

  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    where.created_at = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (instructor) {
    where.instructor_id = BigInt(instructor);
  }

  /**
   * -----------------------------------------
   * STATUS / APPROVAL FILTER
   * -----------------------------------------
   *
   * Frontend labels:
   * Published
   * Pending Review
   * Draft
   * Archived
   *
   * Database values:
   * active
   * is_draft
   * inactive
   *
   * Approval is stored separately in is_approved.
   */

  if (status) {
    switch (status.toLowerCase()) {
      case 'published':
        where.status = 'active';

        // Published should also be approved
        where.is_approved = 'approved';
        break;

      case 'draft':
        where.status = 'is_draft';
        break;

      case 'archived':
        where.status = 'inactive';
        break;

      case 'pending review':
      case 'pending_review':
        // Pending Review is an approval state,
        // not a course status.
        where.is_approved = 'pending';
        break;

      // Already database value
      case 'active':
        where.status = 'active';
        break;

      case 'is_draft':
        where.status = 'is_draft';
        break;

      case 'inactive':
        where.status = 'inactive';
        break;

      default:
        // Allow actual DB status values
        where.status = status;
        break;
    }
  }

  /**
   * Explicit approve_status from API
   *
   * If approve_status is supplied, it should
   * override the automatic approval mapping above.
   */
  if (approveStatus) {
    where.is_approved = approveStatus;
  }

  const order = orderBy === '1' ? 'asc' : 'desc';

  const [total, courses] = await this.prisma.$transaction([
    this.prisma.courses.count({
      where,
    }),

    this.prisma.courses.findMany({
      where,
      orderBy: {
        id: order,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const data = courses.map((course) => {
    const realStudents = course.enrollments.length;

    const students = course.display_students ?? realStudents;

    /**
     * Do not use fake rating.
     * If no rating exists, return 0.
     */
    const rating = course.display_rating
      ? Number(course.display_rating)
      : 0;

    return {
      ...course,

      id: course.id.toString(),

      instructor_id: course.instructor_id.toString(),

      category_id: course.category_id?.toString() ?? null,

      instructor: course.instructor
        ? {
            ...course.instructor,
            id: course.instructor.id.toString(),
          }
        : null,

      enrollments: undefined,

      enrollments_count: realStudents,

      students,

      rating: Math.min(rating, 5),
    };
  });

  return {
    status: 'success',

    data,

    meta: {
      current_page: page,

      last_page:
        total > 0
          ? Math.ceil(total / limit)
          : 0,

      total,
    },
  };
}

async create(dto: CreateCourseDto) {
  const instructorId = BigInt(dto.instructor);
  const categoryId = BigInt(dto.category);

  // -----------------------------------------
  // VALIDATE INSTRUCTOR
  // -----------------------------------------

  const instructor = await this.prisma.users.findUnique({
    where: {
      id: instructorId,
    },
  });

  if (!instructor) {
    throw new NotFoundException('Instructor not found');
  }

  // -----------------------------------------
  // VALIDATE CATEGORY
  // -----------------------------------------

  const category = await this.prisma.course_categories.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new NotFoundException('Course category not found');
  }

  // -----------------------------------------
  // PRICE VALIDATION
  // -----------------------------------------

  const price =
    dto.price !== undefined &&
    dto.price !== null
      ? Number(dto.price)
      : 0;

  const discountPrice =
    dto.discount_price !== undefined &&
    dto.discount_price !== null
      ? Number(dto.discount_price)
      : 0;

  if (price < 0) {
    throw new ConflictException(
      'Course price cannot be negative',
    );
  }

  if (discountPrice < 0) {
    throw new ConflictException(
      'Discount price cannot be negative',
    );
  }

  if (discountPrice > price) {
    throw new ConflictException(
      'Discount price cannot be greater than original price',
    );
  }

  // -----------------------------------------
  // STATUS MAPPING
  // -----------------------------------------

  let dbStatus: courses_status = courses_status.is_draft;

  switch (dto.status?.toLowerCase()) {
    case 'published':
      dbStatus = courses_status.active;
      break;

    case 'archived':
      dbStatus = courses_status.inactive;
      break;

    case 'draft':
      dbStatus = courses_status.is_draft;
      break;

    case 'pending review':
    case 'pending_review':
      dbStatus = courses_status.active;
      break;

    default:
      dbStatus = courses_status.is_draft;
      break;
  }

  // -----------------------------------------
  // APPROVAL STATUS MAPPING
  // -----------------------------------------

  let dbApprovalStatus: courses_is_approved =
    courses_is_approved.pending;

  switch (dto.approval_status?.toLowerCase()) {
    case 'approved':
      dbApprovalStatus = courses_is_approved.approved;
      break;

    case 'rejected':
      dbApprovalStatus = courses_is_approved.rejected;
      break;

    case 'pending':
    default:
      dbApprovalStatus = courses_is_approved.pending;
      break;
  }

  // -----------------------------------------
  // SLUG
  // -----------------------------------------

  const slug = await this.generateUniqueSlug(dto.title);

  // -----------------------------------------
  // CREATE COURSE
  // -----------------------------------------
  
  const course = await this.prisma.courses.create({
    data: {
      title: dto.title,

      slug,

      seo_description:
        dto.seo_description ?? null,

      thumbnail:
        dto.thumbnail,

      demo_video_storage: 'upload',

      demo_video_source:
        dto.demo_video_source ?? null,

      // Original price
      price,

      // Discount / selling price
      discount: discountPrice,

      description:
        dto.description,

      instructor_id: instructorId,

      // CATEGORY
      category_id: categoryId,

      status: dbStatus,

      is_approved: dbApprovalStatus,

      created_at: new Date(),

      updated_at: new Date(),
    },
  });

  // -----------------------------------------
  // RESPONSE
  // -----------------------------------------

  return {
    status: 'success',

    message: 'Course created successfully',

    data: {
      ...course,

      id: course.id.toString(),

      instructor_id:
        course.instructor_id.toString(),

      category_id:
        course.category_id?.toString() ?? null,
    },
  };
}
  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.courses.findFirst({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

async updateBasic(
  id: string,
  dto: CreateCourseDto,
) {
  const courseId = BigInt(id);

  const existingCourse = await this.prisma.courses.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!existingCourse) {
    throw new NotFoundException('Course not found');
  }

  // -----------------------------------------
  // VALIDATE INSTRUCTOR
  // -----------------------------------------

  const instructorId = BigInt(dto.instructor);

  const instructor = await this.prisma.users.findUnique({
    where: {
      id: instructorId,
    },
  });

  if (!instructor) {
    throw new NotFoundException('Instructor not found');
  }

  // -----------------------------------------
  // STATUS MAPPING
  // -----------------------------------------

  let dbStatus: courses_status = existingCourse.status;

  switch (dto.status?.toLowerCase()) {
    case 'published':
    case 'active':
      dbStatus = courses_status.active;
      break;

    case 'pending review':
    case 'pending_review':
      dbStatus = courses_status.active;
      break;

    case 'draft':
    case 'is_draft':
      dbStatus = courses_status.is_draft;
      break;

    case 'archived':
    case 'inactive':
      dbStatus = courses_status.inactive;
      break;
  }

  // -----------------------------------------
  // APPROVAL STATUS MAPPING
  // -----------------------------------------

  let dbApprovalStatus: courses_is_approved =
    existingCourse.is_approved;

  switch (dto.approval_status?.toLowerCase()) {
    case 'approved':
      dbApprovalStatus = courses_is_approved.approved;
      break;

    case 'rejected':
      dbApprovalStatus = courses_is_approved.rejected;
      break;

    case 'pending':
      dbApprovalStatus = courses_is_approved.pending;
      break;
  }

  // -----------------------------------------
  // UPDATE COURSE
  // -----------------------------------------

  const updatedCourse = await this.prisma.courses.update({
    where: {
      id: courseId,
    },

    data: {
      title: dto.title,

      seo_description:
        dto.seo_description ?? null,

      thumbnail:
        dto.thumbnail,

      demo_video_source:
        dto.demo_video_source ?? null,

      price:
        dto.price ?? null,

      discount:
        dto.discount_price ?? null,

      description:
        dto.description,

      instructor_id:
        instructorId,

      // ✅ STATUS
      status:
        dbStatus,

      // ✅ APPROVAL STATUS
      is_approved:
        dbApprovalStatus,

      updated_at:
        new Date(),
    },
  });

  return {
    status: 'success',

    message:
      'Course updated successfully',

    data: {
      ...updatedCourse,

      id:
        updatedCourse.id.toString(),

      instructor_id:
        updatedCourse.instructor_id.toString(),

      category_id:
        updatedCourse.category_id?.toString() ?? null,
    },
  };
}

  async remove(id: string) {
  const courseId = BigInt(id);

  const course = await this.prisma.courses.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  const enrollmentCount = await this.prisma.enrollments.count({
    where: {
      course_id: courseId,
    },
  });

  if (enrollmentCount > 0) {
    throw new ConflictException(
      'Course can not be deleted because it has enrollments',
    );
  }

  await this.prisma.courses.delete({
    where: { id: courseId },
  });

  return {
    status: 'success',
    message: 'Course deleted successfully',
  };
}

async createChapter(dto: CreateCourseChapterDto) {
  const courseId = BigInt(dto.course_id);

  const course = await this.prisma.courses.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      instructor_id: true,
    },
  });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  const lastChapter = await this.prisma.course_chapters.findFirst({
    where: {
      course_id: courseId,
    },
    orderBy: {
      order: 'desc',
    },
    select: {
      order: true,
    },
  });

  const nextOrder = (lastChapter?.order ?? 0) + 1;

  const chapter = await this.prisma.course_chapters.create({
    data: {
      title: dto.title,
      course_id: courseId,
      instructor_id: course.instructor_id,
      order: nextOrder,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    status: 'success',
    message: 'Chapter created successfully',
    data: {
      ...chapter,
      id: chapter.id.toString(),
      course_id: chapter.course_id.toString(),
      instructor_id: chapter.instructor_id.toString(),
    },
  };
}

async findChapterById(id: string) {
  const chapterId = BigInt(id);

  const chapter = await this.prisma.course_chapters.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new NotFoundException('Chapter not found');
  }

  return {
    status: 'success',
    data: {
      ...chapter,
      id: chapter.id.toString(),
      instructor_id: chapter.instructor_id.toString(),
      course_id: chapter.course_id.toString(),
    },
  };
}

async updateChapter(id: string, title: string) {
  const chapterId = BigInt(id);

  const chapter = await this.prisma.course_chapters.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new NotFoundException('Chapter not found');
  }

  const updatedChapter = await this.prisma.course_chapters.update({
    where: {
      id: chapterId,
    },
    data: {
      title,
      updated_at: new Date(),
    },
  });

  return {
    status: 'success',
    message: 'Updated successfully',
    data: {
      ...updatedChapter,
      id: updatedChapter.id.toString(),
      instructor_id: updatedChapter.instructor_id.toString(),
      course_id: updatedChapter.course_id.toString(),
    },
  };
}

async removeChapter(id: string) {
  const chapterId = BigInt(id);

  const chapter = await this.prisma.course_chapters.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new NotFoundException('Chapter not found');
  }

  await this.prisma.course_chapters.delete({
    where: {
      id: chapterId,
    },
  });

  return {
    status: 'success',
    message: 'Chapter deleted successfully',
  };
}

async findChaptersByCourseId(courseId: string) {
  const id = BigInt(courseId);

  const chapters = await this.prisma.course_chapters.findMany({
    where: {
      course_id: id,
    },

    orderBy: {
      order: 'asc',
    },

    include: {
      course_chapter_lessons: {
        where: {
          status: 'active',
        },

        orderBy: {
          order: 'asc',
        },

        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          file_type: true,
          file_path: true,
          downloadable: true,
          is_free: true,
          order: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
  });

  return {
    status: 'success',

    data: chapters.map((chapter) => ({
      id: chapter.id.toString(),
      title: chapter.title,
      course_id: chapter.course_id.toString(),
      instructor_id: chapter.instructor_id.toString(),
      order: chapter.order,
      status: chapter.status,

      lessons: chapter.course_chapter_lessons.map((lesson) => ({
        id: lesson.id.toString(),
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        file_type: lesson.file_type,
        file_path: lesson.file_path,
        downloadable: lesson.downloadable,
        is_free: lesson.is_free,
        order: lesson.order,
        status: lesson.status,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at,
      })),
    })),
  };
}

}