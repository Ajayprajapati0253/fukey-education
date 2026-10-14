
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseAnnouncements(userId: string, slug: string) {
    const course = await this.prisma.courses.findFirst({
      where: {
        slug,
        enrollments: {
          some: {
            user_id: BigInt(userId),
            has_access: true,
          },
        },
      },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    const announcements = await this.prisma.announcements.findMany({
      where: {
        course_id: course.id,
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        instructor_id: true,
        title: true,
        announcement: true,
        created_at: true,
      },
    });

    if (announcements.length === 0) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    const instructorIds = [
      ...new Set(announcements.map((item) => item.instructor_id.toString())),
    ].map((id) => BigInt(id));

    const instructors = await this.prisma.users.findMany({
      where: {
        id: { in: instructorIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    const instructorMap = new Map(
      instructors.map((instructor) => [
        instructor.id.toString(),
        {
          name: instructor.name,
          image: instructor.image,
        },
      ]),
    );

    const data = announcements.map((item) => ({
      instructor_id: item.instructor_id,
      title: item.title,
      announcement: item.announcement,
      created_at: item.created_at,
      instructor:
        instructorMap.get(item.instructor_id.toString()) ?? null,
    }));

    return {
      status: 'success',
      data,
    };
  }
}
