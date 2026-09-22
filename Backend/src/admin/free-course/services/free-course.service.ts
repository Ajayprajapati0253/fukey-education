import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  free_courses_demo_video_storage,
  free_courses_is_approved,
  free_courses_status,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateFreeCourseDto } from '../dto/create-free-course.dto';
import { UpdateFreeCourseDto } from '../dto/update-free-course.dto';
import { UpdateFreeCourseMoreInfoDto } from '../dto/update-free-course-more-info.dto';
import { FinishFreeCourseDto } from '../dto/finish-free-course.dto';
import { UpdateFreeCourseStatusDto } from '../dto/update-free-course-status.dto';

@Injectable()
export class FreeCourseService {
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------
  // LIST COURSES
  // --------------------------------------------------

  async findAll(query: {
    keyword?: string;
    category?: number;
    date?: string;
    approve_status?: string;
    status?: string;
    instructor?: number;
    order_by?: number;
    par_page?: number | string;
  }) {
    const where: Prisma.free_coursesWhereInput = {};

    if (query.keyword) {
      where.title = {
        contains: query.keyword,
      };
    }

    if (query.category !== undefined) {
      where.category_id = BigInt(query.category);
    }

    if (query.date) {
      const start = new Date(`${query.date}T00:00:00`);
      const end = new Date(`${query.date}T23:59:59.999`);

      where.created_at = {
        gte: start,
        lte: end,
      };
    }

    if (query.approve_status) {
      where.is_approved =
        query.approve_status as free_courses_is_approved;
    }

    if (query.status) {
      where.status = query.status as free_courses_status;
    }

    if (query.instructor !== undefined) {
      where.instructor_id = BigInt(query.instructor);
    }

    const orderBy =
      query.order_by === 1 ? 'asc' : 'desc';

    const courses = await this.prisma.free_courses.findMany({
      where,
      orderBy: {
        id: orderBy,
      },
    });

    return this.serialize(courses);
  }

  // --------------------------------------------------
  // GET SINGLE COURSE
  // --------------------------------------------------

  async findOne(id: number) {
    const course = await this.prisma.free_courses.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!course) {
      throw new NotFoundException('Free course not found');
    }

    return this.serialize(course);
  }

  // --------------------------------------------------
  // CREATE / UPDATE COURSE
  // --------------------------------------------------

  async createOrUpdate(dto: CreateFreeCourseDto) {
    const isEdit =
      dto.edit_mode === true && dto.id !== undefined;

    if (isEdit) {
      return this.update(
        dto.id!,
        {
          id: dto.id!,
          title: dto.title,
          seo_description: dto.seo_description,
          thumbnail: dto.thumbnail,
          demo_video_source: dto.demo_video_source,
          path: dto.path,
          description: dto.description,
          instructor: dto.instructor,
          demo_video_storage: dto.demo_video_storage,
        },
      );
    }

    if (!dto.instructor) {
      throw new BadRequestException(
        'Instructor is required',
      );
    }

    const course = await this.prisma.free_courses.create({
      data: {
        title: dto.title,

        slug: await this.generateUniqueSlug(dto.title),

        seo_description:
          dto.seo_description ?? null,

        thumbnail: dto.thumbnail,

        demo_video_storage:
          dto.demo_video_storage
            ? (dto.demo_video_storage as free_courses_demo_video_storage)
            : free_courses_demo_video_storage.upload,

        demo_video_source:
          dto.demo_video_source ??
          dto.path ??
          null,

        description: dto.description,

        instructor_id: BigInt(dto.instructor),
      },
    });

    return {
      status: 'success',
      message: 'Created successfully',
      course: this.serialize(course),
    };
  }

  // --------------------------------------------------
  // UPDATE COURSE
  // --------------------------------------------------

  async update(
    id: number,
    dto: UpdateFreeCourseDto,
  ) {
    const existing =
      await this.prisma.free_courses.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Free course not found',
      );
    }

    const course =
      await this.prisma.free_courses.update({
        where: {
          id: BigInt(id),
        },
        data: {
          title: dto.title,

          seo_description:
            dto.seo_description ?? null,

          thumbnail: dto.thumbnail,

          demo_video_storage:
            dto.demo_video_storage
              ? (dto.demo_video_storage as free_courses_demo_video_storage)
              : existing.demo_video_storage,

          demo_video_source:
            dto.demo_video_source ??
            dto.path ??
            null,

          description: dto.description,

          instructor_id: BigInt(dto.instructor),
        },
      });

    return {
      status: 'success',
      message: 'Updated successfully',
      course: this.serialize(course),
    };
  }

  // --------------------------------------------------
  // MORE INFORMATION
  // --------------------------------------------------

  async updateMoreInfo(
    dto: UpdateFreeCourseMoreInfoDto,
  ) {
    const course =
      await this.prisma.free_courses.findUnique({
        where: {
          id: BigInt(dto.free_course_id),
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Free course not found',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.free_courses.update({
        where: {
          id: BigInt(dto.free_course_id),
        },
        data: {
          duration:
            dto.course_duration ?? null,

          category_id:
            BigInt(dto.category),

          qna:
            dto.qna ?? false,

          partner_instructor:
            dto.partner_instructor ?? false,
        },
      });

      // ----------------------------------------------
      // PARTNER INSTRUCTORS
      // ----------------------------------------------

      await tx.free_course_partner_instructors.deleteMany({
        where: {
          free_course_id:
            BigInt(dto.free_course_id),

          ...(dto.partner_instructors
            ? {
                instructor_id: {
                  notIn:
                    dto.partner_instructors.map(
                      (id) => BigInt(id),
                    ),
                },
              }
            : {}),
        },
      });

      for (
        const instructorId of
        dto.partner_instructors ?? []
      ) {
        const existingPartner =
  await tx.free_course_partner_instructors.findFirst({
    where: {
      free_course_id: BigInt(dto.free_course_id),
      instructor_id: BigInt(instructorId),
    },
  });

if (!existingPartner) {
  await tx.free_course_partner_instructors.create({
    data: {
      free_course_id: BigInt(dto.free_course_id),
      instructor_id: BigInt(instructorId),
    },
  });
}
      }

      // ----------------------------------------------
      // LEVELS
      // ----------------------------------------------

      await tx.free_course_selected_levels.deleteMany({
        where: {
          free_course_id:
            BigInt(dto.free_course_id),

          ...(dto.levels
            ? {
                level_id: {
                  notIn: dto.levels.map(
                    (id) => BigInt(id),
                  ),
                },
              }
            : {}),
        },
      });

      for (const levelId of dto.levels ?? []) {
        await tx.free_course_selected_levels.create({
          data: {
            free_course_id:
              BigInt(dto.free_course_id),

            level_id: BigInt(levelId),
          },
        });
      }

      // ----------------------------------------------
      // LANGUAGES
      // ----------------------------------------------

      await tx.free_course_selected_languages.deleteMany({
        where: {
          free_course_id:
            BigInt(dto.free_course_id),

          ...(dto.languages
            ? {
                language_id: {
                  notIn: dto.languages.map(
                    (id) => BigInt(id),
                  ),
                },
              }
            : {}),
        },
      });

      for (const languageId of dto.languages ?? []) {
        await tx.free_course_selected_languages.create({
          data: {
            free_course_id:
              BigInt(dto.free_course_id),

            language_id: BigInt(languageId),
          },
        });
      }
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
    };
  }

  // --------------------------------------------------
  // FINISH COURSE
  // --------------------------------------------------

  async finish(
    freeCourseId: number,
    dto: FinishFreeCourseDto,
  ) {
    const course =
      await this.prisma.free_courses.findUnique({
        where: {
          id: BigInt(freeCourseId),
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Free course not found',
      );
    }

    await this.prisma.free_courses.update({
      where: {
        id: BigInt(freeCourseId),
      },
      data: {
        status:
          dto.status as free_courses_status,

        message_for_reviewer:
          dto.message_for_reviewer ?? null,
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
    };
  }

  // --------------------------------------------------
  // STATUS / APPROVAL UPDATE
  // --------------------------------------------------

  async updateStatus(
    id: number,
    dto: UpdateFreeCourseStatusDto,
  ) {
    const course =
      await this.prisma.free_courses.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Free course not found',
      );
    }

    await this.prisma.free_courses.update({
      where: {
        id: BigInt(id),
      },
      data: {
        is_approved:
          dto.status as free_courses_is_approved,
      },
    });

    return {
      status: 'success',
      message: 'Updated successfully',
    };
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(id: number) {
    const course =
      await this.prisma.free_courses.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!course) {
      throw new NotFoundException(
        'Free course not found',
      );
    }

    const enrollmentCount = 0;

    if (enrollmentCount > 0) {
      throw new BadRequestException(
        'The course cannot be deleted because it has enrollments.',
      );
    }

    await this.prisma.free_courses.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      status: 'success',
      message: 'Course deleted successfully',
    };
  }

  // --------------------------------------------------
  // BULK DELETE
  // --------------------------------------------------

  async bulkDelete(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException(
        'No course selected!',
      );
    }

    const courses =
      await this.prisma.free_courses.findMany({
        where: {
          id: {
            in: ids.map((id) => BigInt(id)),
          },
        },
      });

    for (const course of courses) {
      await this.prisma.$transaction(async (tx) => {
        await tx.free_course_chapter_items.deleteMany({
          where: {
            chapter_id: {
              in: (
                await tx.free_course_chapters.findMany({
                  where: {
                    free_course_id: course.id,
                  },
                  select: {
                    id: true,
                  },
                })
              ).map((chapter) => chapter.id),
            },
          },
        });

        await tx.free_course_chapters.deleteMany({
          where: {
            free_course_id: course.id,
          },
        });

        await tx.free_course_partner_instructors.deleteMany({
          where: {
            free_course_id: course.id,
          },
        });

        await tx.free_course_selected_levels.deleteMany({
          where: {
            free_course_id: course.id,
          },
        });

        await tx.free_course_selected_languages.deleteMany({
          where: {
            free_course_id: course.id,
          },
        });

        await tx.free_courses.delete({
          where: {
            id: course.id,
          },
        });
      });
    }

    return {
      status: 'success',
      message: 'Selected courses deleted successfully!',
    };
  }

  // --------------------------------------------------
  // SLUG
  // --------------------------------------------------

  private async generateUniqueSlug(
    title: string,
  ): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.free_courses.findFirst({
        where: {
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // --------------------------------------------------
  // SERIALIZE BIGINT
  // --------------------------------------------------

  private serialize<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(data, (_, value) =>
        typeof value === 'bigint'
          ? Number(value)
          : value,
      ),
    );
  }
}