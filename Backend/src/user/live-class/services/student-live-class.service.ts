
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JitsiService } from 'src/admin/live-class/services/jitsi.service';

@Injectable()
export class StudentLiveClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jitsiService: JitsiService,
  ) {}

  async findAll(userId: bigint) {
    const [paidEnrollments, freeEnrollments] = await Promise.all([
      this.prisma.enrollments.findMany({
        where: { user_id: userId },
        select: { course_id: true },
      }),
      this.prisma.free_course_enrollments.findMany({
        where: { user_id: userId },
        select: { free_course_id: true },
      }),
    ]);

    const courseIds = paidEnrollments.map((item) => item.course_id);
    const freeCourseIds = freeEnrollments.map(
      (item) => item.free_course_id,
    );

    if (!courseIds.length && !freeCourseIds.length) {
      return { status: true, data: [] };
    }

    const liveClasses = await this.prisma.live_classes.findMany({
      where: {
        status: true,
        OR: [
          ...(courseIds.length
            ? [{ course_id: { in: courseIds } }]
            : []),
          ...(freeCourseIds.length
            ? [{ free_course_id: { in: freeCourseIds } }]
            : []),
        ],
      },
      include: {
        users: {
          select: { id: true, name: true },
        },
        courses: {
          select: { id: true, title: true },
        },
      },
      orderBy: [
        { start_time: 'asc' },
        { id: 'asc' },
      ],
    });

    const freeCourseIdsInResult = [
      ...new Set(
        liveClasses
          .map((item) => item.free_course_id)
          .filter((id): id is bigint => id !== null),
      ),
    ];

    const freeCourses = freeCourseIdsInResult.length
      ? await this.prisma.free_courses.findMany({
          where: { id: { in: freeCourseIdsInResult } },
          select: { id: true, title: true },
        })
      : [];

    const freeCourseMap = new Map(
      freeCourses.map((course) => [course.id.toString(), course]),
    );

    const data = liveClasses.map((item) => {
      const { users, courses, ...liveClass } = item;

      return {
        ...liveClass,
        instructor: users,
        course: courses,
        freeCourse: item.free_course_id
          ? freeCourseMap.get(item.free_course_id.toString()) ?? null
          : null,
      };
    });

    return { status: true, data };
  }

  async join(userId: bigint, liveClassId: bigint) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.role !== 'student') {
      throw new ForbiddenException('Student access required.');
    }

    const liveClass = await this.prisma.live_classes.findUnique({
      where: { id: liveClassId },
    });

    if (!liveClass) {
      throw new NotFoundException('Live class not found.');
    }

    if (!liveClass.status) {
      throw new ForbiddenException('Class inactive.');
    }

    if (liveClass.platform === 'youtube') {
      if (!liveClass.free_course_id) {
        throw new ForbiddenException('Free course is not linked.');
      }

      const enrollment =
        await this.prisma.free_course_enrollments.findUnique({
          where: {
            user_id_free_course_id: {
              user_id: userId,
              free_course_id: liveClass.free_course_id,
            },
          },
        });

      if (!enrollment) {
        throw new ForbiddenException('Not enrolled.');
      }

      return {
        status: true,
        platform: 'youtube',
        video_id: liveClass.youtube_video_id,
      };
    }

    if (!liveClass.course_id) {
      throw new ForbiddenException('Course is not linked.');
    }

    const enrollment = await this.prisma.enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: liveClass.course_id,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled.');
    }

    const token = this.jitsiService.generateJwt(
      user,
      liveClass,
      false,
    );

    const domain = process.env.JITSI_DOMAIN;

    if (!domain) {
      throw new Error('JITSI_DOMAIN is not configured.');
    }

    return {
      status: true,
      platform: 'jitsi',
      join_url: `https://${domain}/${liveClass.meeting_id}?jwt=${token}`,
    };
  }
}
