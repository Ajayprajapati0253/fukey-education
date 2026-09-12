import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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

    if (approveStatus) {
      where.is_approved = approveStatus;
    }

    if (status) {
      where.status = status;
    }

    if (instructor) {
      where.instructor_id = BigInt(instructor);
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

      const students = course.display_students
        ? course.display_students
        : realStudents < 50
          ? Math.floor(Math.random() * 121) + 80
          : realStudents;

      const rating = course.display_rating
        ? course.display_rating.toString()
        : '4.5';

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
        rating: Math.min(Number(rating), 4.8),
      };
    });

    return {
      status: 'success',
      data,
      meta: {
        current_page: page,
        last_page: total > 0 ? Math.ceil(total / limit) : 0,
        total,
      },
    };
  }

  async create(dto: CreateCourseDto) {
    const instructorId = BigInt(dto.instructor);

    const instructor = await this.prisma.users.findUnique({
      where: {
        id: instructorId,
      },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const slug = await this.generateUniqueSlug(dto.title);

    const course = await this.prisma.courses.create({
      data: {
        title: dto.title,
        slug,
        seo_description: dto.seo_description ?? null,
        thumbnail: dto.thumbnail,
        demo_video_storage: 'upload',
        demo_video_source: dto.demo_video_source ?? null,
        price: dto.price ?? null,
        discount: dto.discount_price ?? null,
        description: dto.description,
        instructor_id: instructorId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course created successfully',
      data: {
        ...course,
        id: course.id.toString(),
        instructor_id: course.instructor_id.toString(),
        category_id: course.category_id?.toString() ?? null,
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

    const instructorId = BigInt(dto.instructor);

    const instructor = await this.prisma.users.findUnique({
      where: {
        id: instructorId,
      },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const updatedCourse = await this.prisma.courses.update({
      where: {
        id: courseId,
      },
      data: {
        title: dto.title,
        seo_description: dto.seo_description ?? null,
        thumbnail: dto.thumbnail,
        demo_video_source: dto.demo_video_source ?? null,
        price: dto.price ?? null,
        discount: dto.discount_price ?? null,
        description: dto.description,
        instructor_id: instructorId,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Course updated successfully',
      data: {
        ...updatedCourse,
        id: updatedCourse.id.toString(),
        instructor_id: updatedCourse.instructor_id.toString(),
        category_id: updatedCourse.category_id?.toString() ?? null,
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

}