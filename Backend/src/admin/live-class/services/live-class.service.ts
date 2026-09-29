import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateLiveClassDto } from '../dto/create-live-class.dto';
import { UpdateLiveClassDto } from '../dto/update-live-class.dto';

@Injectable()
export class LiveClassService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const liveClasses =
      await this.prisma.live_classes.findMany({
        orderBy: {
          start_time: 'desc',
        },
      });

    return {
      status: 'success',
      data: this.serialize(liveClasses),
    };
  }

  async create(dto: CreateLiveClassDto) {
    /*
     * ----------------------------------------------------
     * 1. Validate instructor
     * ----------------------------------------------------
     */

    const instructor =
      await this.prisma.users.findUnique({
        where: {
          id: BigInt(dto.instructor),
        },
      });

    if (!instructor) {
      throw new NotFoundException(
        'Instructor not found.',
      );
    }

    /*
     * ----------------------------------------------------
     * 2. Validate platform
     * ----------------------------------------------------
     */

    const platform = dto.platform ?? 'jitsi';

    if (!['jitsi', 'youtube'].includes(platform)) {
      throw new BadRequestException(
        'Invalid live class platform.',
      );
    }

    /*
     * ----------------------------------------------------
     * 3. Validate course/free course
     * ----------------------------------------------------
     */

    if (platform === 'jitsi') {
      if (!dto.course_id) {
        throw new BadRequestException(
          'Course is required for Jitsi live class.',
        );
      }

      const course =
        await this.prisma.courses.findUnique({
          where: {
            id: BigInt(dto.course_id),
          },
        });

      if (!course) {
        throw new NotFoundException(
          'Course not found.',
        );
      }
    }

    if (platform === 'youtube') {
      if (!dto.free_course_id) {
        throw new BadRequestException(
          'Free course is required for YouTube live class.',
        );
      }

      const freeCourse =
        await this.prisma.free_courses.findUnique({
          where: {
            id: BigInt(dto.free_course_id),
          },
        });

      if (!freeCourse) {
        throw new NotFoundException(
          'Free course not found.',
        );
      }
    }

    /*
     * ----------------------------------------------------
     * 4. Generate meeting ID
     * ----------------------------------------------------
     *
     * Phase 2 Jitsi/YouTube service integration will be
     * connected here.
     *
     * For now we generate the same meeting ID format
     * used by the Laravel implementation.
     */

    const randomPart = Math.random()
      .toString(36)
      .substring(2, 12);

    const meetingId = `class-${randomPart}`;

    const meetingUrl =
      platform === 'jitsi'
        ? `https://${process.env.JITSI_DOMAIN}/${meetingId}`
        : null;

    /*
     * ----------------------------------------------------
     * 5. Create Live Class + Course structure
     * ----------------------------------------------------
     */

    const liveClass =
      await this.prisma.$transaction(
        async (tx) => {
          /*
           * --------------------------------------------
           * Create live_classes record
           * --------------------------------------------
           */

          const createdLiveClass =
            await tx.live_classes.create({
              data: {
                title: dto.title,

                instructor_id:
                  BigInt(dto.instructor),

                course_id:
                  platform === 'jitsi' &&
                  dto.course_id
                    ? BigInt(dto.course_id)
                    : null,

                free_course_id:
                  platform === 'youtube' &&
                  dto.free_course_id
                    ? BigInt(dto.free_course_id)
                    : null,

                meeting_id: meetingId,

                meeting_url: meetingUrl,

                description:
                  dto.description ?? null,

                start_time: new Date(
                  dto.start_time!,
                ),

                duration: dto.duration,

                is_recurring:
                  Array.isArray(
                    dto.recurring_days,
                  ) &&
                  dto.recurring_days.length > 0,

                recurring_days:
                  dto.recurring_days ?? undefined,

                end_date:
                  dto.end_date
                    ? new Date(dto.end_date)
                    : null,

                status: dto.status,

                platform,

                youtube_video_id:
                  dto.youtube_video_id ?? null,

                created_at: new Date(),

                updated_at: new Date(),
              },
            });

          /*
           * --------------------------------------------
           * Course live class
           * --------------------------------------------
           */

          if (
            platform === 'jitsi' &&
            dto.course_id
          ) {
            const courseId =
              BigInt(dto.course_id);

            /*
             * Create "Live Classes" chapter
             */

            const chapter =
              await tx.course_chapters.create({
                data: {
                  title: 'Live Classes',

                  instructor_id:
                    BigInt(dto.instructor),

                  course_id: courseId,

                  order: 0,

                  status: 'active',

                  created_at: new Date(),

                  updated_at: new Date(),
                },
              });

            /*
             * Create live item
             */

            const chapterItem =
              await tx.course_chapter_items.create({
                data: {
                  instructor_id:
                    BigInt(dto.instructor),

                  chapter_id: chapter.id,

                  type: 'live',

                  order: 0,

                  created_at: new Date(),

                  updated_at: new Date(),
                },
              });

            /*
             * Create lesson
             */

            const lesson =
              await tx.course_chapter_lessons.create({
                data: {
                  title: dto.title,

                  instructor_id:
                    BigInt(dto.instructor),

                  course_id: courseId,

                  chapter_id: chapter.id,

                  chapter_item_id:
                    chapterItem.id,

                  description:
                    dto.description ?? null,

                  file_type: 'video',

                  downloadable: false,

                  is_free: false,

                  status: 'active',

                  created_at: new Date(),

                  updated_at: new Date(),
                },
              });

            /*
             * Connect lesson with live class
             */

            await tx.course_live_classes.create({
              data: {
                lesson_id: lesson.id,

                start_time:
                  dto.start_time,

                type: 'jitsi',

                is_recurring:
                  Array.isArray(
                    dto.recurring_days,
                  ) &&
                  dto.recurring_days.length > 0,

                recurring_days:
                  dto.recurring_days ??
                  undefined,

                recurring_until:
                  dto.end_date
                    ? new Date(dto.end_date)
                    : null,

                meeting_id:
                  createdLiveClass.meeting_id,

                join_url:
                  createdLiveClass.meeting_url,

                created_at: new Date(),

                updated_at: new Date(),
              },
            });
          }

          /*
           * --------------------------------------------
           * Free Course structure
           * --------------------------------------------
           */

          if (
            platform === 'youtube' &&
            dto.free_course_id
          ) {
            const freeCourseId =
              BigInt(dto.free_course_id);

            /*
             * Create "Live Classes" chapter
             */

            const chapter =
              await tx.free_course_chapters.create({
                data: {
                  title: 'Live Classes',

                  instructor_id:
                    BigInt(dto.instructor),

                  free_course_id:
                    freeCourseId,

                  order: 0,

                  status: 'active',

                  created_at: new Date(),

                  updated_at: new Date(),
                },
              });

            /*
             * Create live item
             */

            const chapterItem =
              await tx.free_course_chapter_items.create({
                data: {
                  instructor_id:
                    BigInt(dto.instructor),

                  chapter_id: chapter.id,

                  type: 'live',

                  order: 0,

                  created_at: new Date(),

                  updated_at: new Date(),
                },
              });

            /*
             * Create lesson
             */

            await tx.free_course_chapter_lessons.create({
              data: {
                title: dto.title,

                instructor_id:
                  BigInt(dto.instructor),

                free_course_id:
                  freeCourseId,

                chapter_id: chapter.id,

                chapter_item_id:
                  chapterItem.id,

                description:
                  dto.description ?? null,

                file_type: 'video',

                downloadable: false,

                is_free: true,

                status: 'active',

                created_at: new Date(),

                updated_at: new Date(),
              },
            });

            /*
             * IMPORTANT:
             *
             * We are NOT inserting into
             * course_live_classes here yet because
             * its FK points to course_chapter_lessons,
             * not free_course_chapter_lessons.
             */
          }

          return createdLiveClass;
        },
      );

    return {
      status: 'success',

      message:
        'Live class created successfully.',

      data: this.serialize(liveClass),
    };
  }

  async findOne(id: number) {
    const liveClass =
      await this.prisma.live_classes.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!liveClass) {
      throw new NotFoundException(
        'Live class not found.',
      );
    }

    return {
      status: 'success',
      data: this.serialize(liveClass),
    };
  }

  async update(
    id: number,
    dto: UpdateLiveClassDto,
  ) {
    const existing =
      await this.prisma.live_classes.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Live class not found.',
      );
    }

    const updated =
      await this.prisma.live_classes.update({
        where: {
          id: BigInt(id),
        },

        data: {
          title: dto.title,

          instructor_id:
            BigInt(dto.instructor),

          start_time:
            new Date(dto.start_time),

          duration: dto.duration,

          description:
            dto.description ?? null,

          status: dto.status,

          updated_at: new Date(),
        },
      });

    return {
      status: 'success',

      message:
        'Live class updated successfully.',

      data: this.serialize(updated),
    };
  }

  async remove(id: number) {
    const existing =
      await this.prisma.live_classes.findUnique({
        where: {
          id: BigInt(id),
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Live class not found.',
      );
    }

    await this.prisma.live_classes.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      status: 'success',

      message:
        'Live class deleted successfully.',
    };
  }

  private serialize<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(
        data,
        (_, value) =>
          typeof value === 'bigint'
            ? Number(value)
            : value,
      ),
    );
  }

async getKpi() {
  const now = new Date();

  const liveClasses =
    await this.prisma.live_classes.findMany({
      select: {
        id: true,
        start_time: true,
        duration: true,
        status: true,
        is_recurring: true,
        recurring_days: true,
        recurring_time: true,
        end_date: true,
      },
    });

  let live = 0;
  let upcoming = 0;
  let completed = 0;
  let cancelled = 0;

  for (const liveClass of liveClasses) {
    /*
     * Cancelled
     */
    if (!liveClass.status) {
      cancelled++;
      continue;
    }

    /*
     * Normal one-time class
     */
    if (!liveClass.is_recurring) {
      const startTime = liveClass.start_time;

      const endTime = new Date(
        startTime.getTime() +
          liveClass.duration * 60 * 1000,
      );

      if (
        now >= startTime &&
        now < endTime
      ) {
        live++;
      } else if (now < startTime) {
        upcoming++;
      } else {
        completed++;
      }

      continue;
    }

    /*
     * Recurring class
     */

    const recurringDays =
      Array.isArray(liveClass.recurring_days)
        ? liveClass.recurring_days
        : [];

    if (recurringDays.length === 0) {
      completed++;
      continue;
    }

    /*
     * Recurring class has an end date.
     *
     * If the recurrence has completely expired,
     * count it as completed.
     */
    if (
      liveClass.end_date &&
      now > liveClass.end_date
    ) {
      completed++;
      continue;
    }

    /*
     * Find the occurrence for today.
     */
    const dayNames = [
      'sun',
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
    ];

    const todayName =
      dayNames[now.getDay()];

    const runsToday =
      recurringDays.includes(todayName);

    if (runsToday) {
      /*
       * Build today's recurring start time.
       */
      const recurringTime =
        liveClass.recurring_time;

      if (!recurringTime) {
        continue;
      }

      const occurrenceStart =
        new Date(now);

      occurrenceStart.setHours(
        recurringTime.getHours(),
        recurringTime.getMinutes(),
        recurringTime.getSeconds(),
        0,
      );

      const occurrenceEnd =
        new Date(
          occurrenceStart.getTime() +
            liveClass.duration * 60 * 1000,
        );

      /*
       * Live right now
       */
      if (
        now >= occurrenceStart &&
        now < occurrenceEnd
      ) {
        live++;
        continue;
      }

      /*
       * Today's occurrence is still upcoming
       */
      if (now < occurrenceStart) {
        upcoming++;
        continue;
      }

      /*
       * Today's occurrence already finished.
       *
       * We don't count this recurring parent
       * as completed because it may have another
       * occurrence later.
       */
      continue;
    }

    /*
     * It doesn't run today.
     *
     * Check whether there is another occurrence
     * before the end date.
     */
    const hasFutureOccurrence =
      this.hasFutureRecurringOccurrence(
        now,
        recurringDays,
        liveClass.recurring_time,
        liveClass.end_date,
      );

    if (hasFutureOccurrence) {
      upcoming++;
    } else {
      completed++;
    }
  }

  return {
    status: 'success',
    data: {
      total: liveClasses.length,
      live,
      upcoming,
      completed,
      cancelled,
    },
  };
}

private hasFutureRecurringOccurrence(
  now: Date,
  recurringDays: unknown[],
  recurringTime: Date | null,
  endDate: Date | null,
): boolean {
  if (!recurringTime) {
    return false;
  }

  const dayNames = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
  ];

  const allowedDays =
    recurringDays.filter(
      (day): day is string =>
        typeof day === 'string',
    );

  for (let i = 1; i <= 7; i++) {
    const futureDate =
      new Date(now);

    futureDate.setDate(
      futureDate.getDate() + i,
    );

    futureDate.setHours(
      recurringTime.getHours(),
      recurringTime.getMinutes(),
      recurringTime.getSeconds(),
      0,
    );

    if (
      endDate &&
      futureDate > endDate
    ) {
      continue;
    }

    const dayName =
      dayNames[futureDate.getDay()];

    if (
      allowedDays.includes(dayName)
    ) {
      return true;
    }
  }

  return false;
}
}