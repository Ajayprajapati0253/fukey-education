import {
    BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { JitsiService } from 'src/admin/live-class/services/jitsi.service';
import { YoutubeLiveService } from 'src/admin/live-class/services/youtube-live.service';
import { CreateInstructorLiveClassDto } from '../dto/create-instructor-live-class.dto';

@Injectable()
export class InstructorLiveClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jitsiService: JitsiService,
      private readonly youtubeLiveService: YoutubeLiveService,

  ) {}

  async findAll(instructorId: bigint) {
    /*
     * ----------------------------------------------------
     * 1. Get normal live classes of instructor
     * ----------------------------------------------------
     */

    const liveClasses =
      await this.prisma.live_classes.findMany({
        where: {
          instructor_id: instructorId,
        },

        include: {
          courses: {
            select: {
              id: true,
              title: true,
            },
          },

          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          start_time: 'desc',
        },
      });

    /*
     * ----------------------------------------------------
     * 2. Find recurring masters which already have
     *    generated instances
     * ----------------------------------------------------
     */

    const recurringMasters =
      liveClasses.filter(
        (item) => item.is_recurring,
      );

    const recurringMasterIds =
      recurringMasters.map(
        (item) => item.id,
      );

    let generatedParentIds: bigint[] = [];

    if (recurringMasterIds.length > 0) {
      const generated =
        await this.prisma.course_live_classes.findMany({
          where: {
            parent_live_class_id: {
              in: recurringMasterIds,
            },

            is_generated_instance: true,
          },

          select: {
            parent_live_class_id: true,
          },
        });

      generatedParentIds = generated
        .map(
          (item) =>
            item.parent_live_class_id,
        )
        .filter(
          (id): id is bigint =>
            id !== null &&
            id !== undefined,
        );
    }

    /*
     * ----------------------------------------------------
     * 3. Remove recurring master classes which already
     *    have generated instances
     * ----------------------------------------------------
     */

    const normalClasses =
      liveClasses.filter((item) => {
        if (!item.is_recurring) {
          return true;
        }

        return !generatedParentIds.some(
          (id) => id === item.id,
        );
      });

    /*
     * ----------------------------------------------------
     * 4. Get generated recurring instances
     *
     * course_live_classes
     *       ↓
     * course_chapter_lessons
     *       ↓
     * course_chapters
     *       ↓
     * courses
     * ----------------------------------------------------
     */

    const generatedInstances =
      await this.prisma.course_live_classes.findMany({
        where: {
          is_generated_instance: true,

          course_chapter_lessons: {
            instructor_id: instructorId,
          },
        },

        include: {
          course_chapter_lessons: {
            select: {
              id: true,
              title: true,
              course_id: true,

              course_chapters: {
                select: {
                  id: true,

                  courses: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          start_time: 'desc',
        },
      });

    /*
     * ----------------------------------------------------
     * 5. Format normal classes
     * ----------------------------------------------------
     */

    const normalData =
      normalClasses.map(
        (liveClass) => {
          let instructorUrl: string | null =
            null;

          /*
           * Generate moderator Jitsi URL
           * only for Jitsi classes.
           */

          if (
            liveClass.platform === 'jitsi' &&
            liveClass.meeting_url &&
            liveClass.meeting_id
          ) {
            const token =
              this.jitsiService.generateJwt(
                {
                  id: instructorId,

                  name:
                    liveClass.users?.name ??
                    '',

                  email:
                    liveClass.users?.email ??
                    null,
                },

                {
                  is_recurring:
                    liveClass.is_recurring,

                  recurring_time:
                    liveClass.recurring_time,

                  start_time:
                    liveClass.start_time,

                  duration:
                    liveClass.duration,

                  meeting_id:
                    liveClass.meeting_id,
                },

                true,
              );

            instructorUrl =
              `${liveClass.meeting_url}?jwt=${token}`;
          }

          return {
            ...liveClass,

            instructor_url:
              instructorUrl,

            is_generated: false,

            is_recurring:
              liveClass.is_recurring,

            recurring_days:
              liveClass.recurring_days ??
              [],

            recurring_time:
              liveClass.recurring_time,

            end_date:
              liveClass.end_date,
          };
        },
      );

    /*
     * ----------------------------------------------------
     * 6. Format generated recurring instances
     * ----------------------------------------------------
     */

    const generatedData =
      generatedInstances.map(
        (item) => {
          const lesson =
            item.course_chapter_lessons;

          const course =
            lesson?.course_chapters
              ?.courses ?? null;

          const meetingId =
            item.meeting_id;

          const meetingUrl =
            meetingId
              ? this.jitsiService.generateMeetingUrl(
                  meetingId,
                )
              : null;

          let instructorUrl: string | null =
            null;

          /*
           * Generate moderator URL only when
           * meeting id and start time exist.
           */

          if (
            meetingId &&
            meetingUrl &&
            item.start_time
          ) {
            const token =
              this.jitsiService.generateJwt(
                {
                  id: instructorId,

                  name: '',

                  email: null,
                },

                {
                  is_recurring: false,

                  recurring_time: null,

                  start_time:
                    item.start_time,

                  duration: 60,

                  meeting_id:
                    meetingId,
                },

                true,
              );

            instructorUrl =
              `${meetingUrl}?jwt=${token}`;
          }

          return {
            id: item.id,

            title:
              lesson?.title ??
              'Live Class',

            course,

            meeting_id:
              meetingId,

            meeting_url:
              meetingUrl,

            meeting_password:
              item.password ?? null,

            moderator_token:
              null,

            moderator_url:
              instructorUrl,

            thumbnail:
              null,

            description:
              '',

            start_time:
              item.start_time,

            duration:
              60,

            status:
              true,

            platform:
              item.type,

            youtube_video_id:
              null,

            is_generated:
              true,

            is_recurring:
              true,

            recurring_days:
              [],

            recurring_time:
              null,

            end_date:
              null,

            course_id:
              lesson?.course_id ??
              null,

            instructor_id:
              instructorId,

            created_at:
              item.created_at,

            updated_at:
              item.updated_at,
          };
        },
      );

    /*
     * ----------------------------------------------------
     * 7. Merge normal + generated classes
     * ----------------------------------------------------
     */

    const allClasses = [
      ...normalData,
      ...generatedData,
    ];

    /*
     * ----------------------------------------------------
     * 8. Sort
     *
     * Live      → First
     * Upcoming  → Second
     * Completed → Last
     * ----------------------------------------------------
     */

    const now = Date.now();

    allClasses.sort(
      (a: any, b: any) => {
        const aTime = a.start_time
          ? new Date(
              a.start_time,
            ).getTime()
          : 0;

        const bTime = b.start_time
          ? new Date(
              b.start_time,
            ).getTime()
          : 0;

        const aEnd =
          aTime +
          Number(a.duration) *
            60 *
            1000;

        const bEnd =
          bTime +
          Number(b.duration) *
            60 *
            1000;

        /*
         * Live
         */

        const aLive =
          aTime > 0 &&
          aTime <= now &&
          now <= aEnd;

        const bLive =
          bTime > 0 &&
          bTime <= now &&
          now <= bEnd;

        if (aLive && !bLive) {
          return -1;
        }

        if (!aLive && bLive) {
          return 1;
        }

        /*
         * Upcoming
         */

        const aUpcoming =
          aTime > now;

        const bUpcoming =
          bTime > now;

        if (
          aUpcoming &&
          !bUpcoming
        ) {
          return -1;
        }

        if (
          !aUpcoming &&
          bUpcoming
        ) {
          return 1;
        }

        /*
         * Same category:
         * latest first
         */

        return bTime - aTime;
      },
    );

    /*
     * ----------------------------------------------------
     * 9. Response
     * ----------------------------------------------------
     */

    return {
      status: 'success',

      data:
        this.serialize(
          allClasses,
        ),
    };
  }

  /*
   * ------------------------------------------------------
   * Serialize BigInt values
   * ------------------------------------------------------
   */

  private serialize(
    data: any,
  ): any {
    return JSON.parse(
      JSON.stringify(
        data,
        (_, value) =>
          typeof value ===
          'bigint'
            ? value.toString()
            : value,
      ),
    );
  }

  async findOne(
  id: bigint,
  instructorId: bigint,
)

{

  const liveClass =
    await this.prisma.live_classes.findFirst({
      where: {
        id,
        instructor_id: instructorId,
      },
      include: {
        courses: true,
      },
    });

  if (!liveClass) {
    throw new Error('Live class not found.');
  }

  // YOUTUBE PATH
  // Laravel mein yahan Jitsi/JWT involved nahi hai.
  if (liveClass.platform === 'youtube') {
    return this.serialize({
      status: 'success',
      platform: 'youtube',
      live_class: liveClass,
    });
  }

  // JITSI PATH
  const instructor =
    await this.prisma.users.findUnique({
      where: {
        id: instructorId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

  if (!instructor) {
    throw new Error('Instructor not found.');
  }

  const jwtToken =
    this.jitsiService.generateJwt(
      {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
      },
      {
        is_recurring: liveClass.is_recurring,
        recurring_time: liveClass.recurring_time,
        start_time: liveClass.start_time,
        duration: liveClass.duration,
        meeting_id: liveClass.meeting_id,
      },
      true,
    );

  const instructorUrl =
    `${this.jitsiService.generateMeetingUrl(
      liveClass.meeting_id,
    )}?jwt=${jwtToken}`;

  return this.serialize({
    status: 'success',
    platform: 'jitsi',
    live_class: liveClass,
    instructor_url: instructorUrl,
  });
}

async create(
  instructorId: bigint,
  dto: CreateInstructorLiveClassDto,
) {
  const platform = dto.platform ?? 'jitsi';

  /*
   * -----------------------------------------
   * BASIC VALIDATION
   * -----------------------------------------
   */

  if (!dto.title?.trim()) {
    throw new BadRequestException(
      'Title is required.',
    );
  }

  if (!dto.duration || dto.duration < 10) {
    throw new BadRequestException(
      'Duration must be at least 10 minutes.',
    );
  }

  if (!['jitsi', 'youtube'].includes(platform)) {
    throw new BadRequestException(
      'Platform must be jitsi or youtube.',
    );
  }

  /*
   * Laravel:
   *
   * $isRecurring =
   *     $platform === 'jitsi'
   *     && $request->has('recurring_days');
   */
  const isRecurring =
    platform === 'jitsi' &&
    Array.isArray(dto.recurring_days) &&
    dto.recurring_days.length > 0;

  /*
   * Non-recurring class requires start_time.
   */
  if (!isRecurring && !dto.start_time) {
    throw new BadRequestException(
      'Start time is required.',
    );
  }

  /*
   * YouTube does not support recurring classes
   * according to Laravel implementation.
   */
  if (
    platform === 'youtube' &&
    dto.recurring_days &&
    dto.recurring_days.length > 0
  ) {
    throw new BadRequestException(
      'Recurring classes are only supported on Jitsi.',
    );
  }

  /*
   * -----------------------------------------
   * COURSE / FREE COURSE OWNERSHIP
   * -----------------------------------------
   */

  let course: {
    id: bigint;
    title: string;
  } | null = null;

  let freeCourse: {
    id: bigint;
    title: string;
  } | null = null;

  if (platform === 'youtube') {
    /*
     * Laravel:
     *
     * free_course_id required
     * instructor must own free course
     */
    if (!dto.free_course_id) {
      throw new BadRequestException(
        'Free course is required for YouTube live class.',
      );
    }

    freeCourse =
      await this.prisma.free_courses.findFirst({
        where: {
          id: BigInt(dto.free_course_id),
          instructor_id: instructorId,
        },
        select: {
          id: true,
          title: true,
        },
      });

    if (!freeCourse) {
      throw new BadRequestException(
        'You can only schedule classes for your own free courses.',
      );
    }
  } else {
    /*
     * Laravel:
     *
     * course_id required
     * instructor must own course
     */
    if (!dto.course_id) {
      throw new BadRequestException(
        'Course is required for Jitsi live class.',
      );
    }

    course =
      await this.prisma.courses.findFirst({
        where: {
          id: BigInt(dto.course_id),
          instructor_id: instructorId,
        },
        select: {
          id: true,
          title: true,
        },
      });

    if (!course) {
      throw new BadRequestException(
        'You can only schedule classes for your own courses.',
      );
    }
  }

  /*
   * -----------------------------------------
   * CREATE EVERYTHING IN TRANSACTION
   * -----------------------------------------
   */

  return this.prisma.$transaction(
    async (tx) => {
      let meetingId: string;
      let meetingUrl: string;

      let youtubeBroadcastId: string | null =
        null;

      let youtubeStreamId: string | null =
        null;

      let youtubeStreamKey: string | null =
        null;

      let youtubeRtmpUrl: string | null =
        null;

      let startTime: Date;
      let recurringTime: Date | null = null;
      let endDate: Date | null = null;

      /*
       * ---------------------------------------
       * YOUTUBE
       * ---------------------------------------
       */

      if (platform === 'youtube') {
        if (!dto.start_time) {
          throw new BadRequestException(
            'Start time is required for YouTube live class.',
          );
        }

        const youtube =
          await this.youtubeLiveService.createLive({
            title: dto.title,
            description: dto.description,
            start_time: new Date(
              dto.start_time,
            ).toISOString(),
          });

       youtubeBroadcastId =
  youtube.broadcast_id ?? null;

youtubeStreamId =
  youtube.stream_id ?? null;

youtubeStreamKey =
  youtube.stream_key ?? null;

youtubeRtmpUrl =
  youtube.rtmp_url ?? null;

        meetingId =
          `yt-${this.randomString(12)}`;

        meetingUrl =
          youtube.watch_url;

        startTime =
          new Date(dto.start_time);

        /*
         * Laravel YouTube:
         *
         * is_recurring = false
         * recurring_days = null
         * recurring_time = null
         * end_date = null
         */
      } else {
        /*
         * ---------------------------------------
         * JITSI
         * ---------------------------------------
         */

        meetingId =
          this.jitsiService.generateMeetingId();

        meetingUrl =
          this.jitsiService.generateMeetingUrl(
            meetingId,
          );

        if (isRecurring) {
          if (!dto.recurring_time) {
            throw new BadRequestException(
              'Recurring time is required.',
            );
          }

          recurringTime =
            this.parseTimeToDate(
              dto.recurring_time,
            );

          /*
           * Laravel:
           *
           * now()->setTimeFromTimeString(...)
           */
          const today = new Date();

          startTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            recurringTime.getHours(),
            recurringTime.getMinutes(),
            recurringTime.getSeconds(),
            0,
          );

          if (dto.end_date) {
            endDate =
              new Date(dto.end_date);
          }
        } else {
          startTime =
            new Date(dto.start_time!);
        }
      }

      /*
       * ---------------------------------------
       * LIVE CLASS
       * ---------------------------------------
       */

      const liveClass =
        await tx.live_classes.create({
          data: {
            title: dto.title,

            instructor_id:
              instructorId,

            course_id:
              course?.id ?? null,

            free_course_id:
              freeCourse?.id ?? null,

            platform: platform as any,

            description:
              dto.description ?? null,

            duration:
              dto.duration,

            status: true,

            meeting_id:
              meetingId,

            meeting_url:
              meetingUrl,

            start_time:
              startTime,

            is_recurring:
              isRecurring,

            recurring_days:
  isRecurring
    ? dto.recurring_days ?? []
    : Prisma.JsonNull,

            recurring_time:
              recurringTime,

            end_date:
              endDate,

            youtube_video_id:
              youtubeBroadcastId,

            youtube_broadcast_id:
              youtubeBroadcastId,

            youtube_stream_id:
              youtubeStreamId,

            youtube_stream_key:
              youtubeStreamKey,

            youtube_rtmp_url:
              youtubeRtmpUrl,
          },
        });

      /*
       * ---------------------------------------
       * COURSE LIVE CLASS BASE DATA
       * ---------------------------------------
       */

      const courseLiveClassData: any = {
        meeting_id:
          liveClass.meeting_id,

        start_time:
          liveClass.is_recurring
            ? this.formatDateTime(
                liveClass.start_time,
              )
            : this.formatDateTime(
                liveClass.start_time,
              ),

        type: platform,

        is_recurring:
          liveClass.is_recurring,

        recurring_days:
          liveClass.recurring_days,

        recurring_type:
          liveClass.is_recurring
            ? 'weekly'
            : null,

        recurring_interval: 1,

        recurring_until:
          liveClass.end_date,

        is_generated_instance:
          false,

        parent_live_class_id:
          null,
      };

      /*
       * ---------------------------------------
       * YOUTUBE / FREE COURSE
       * ---------------------------------------
       */

      if (platform === 'youtube') {
        /*
         * Find existing "Live Classes" chapter
         * or create it.
         */

        let chapter =
          await tx.free_course_chapters.findFirst({
            where: {
              free_course_id:
                freeCourse!.id,

              title: 'Live Classes',
            },
          });

        if (!chapter) {
          const count =
            await tx.free_course_chapters.count({
              where: {
                free_course_id:
                  freeCourse!.id,
              },
            });

          chapter =
            await tx.free_course_chapters.create({
              data: {
                title: 'Live Classes',

                instructor_id:
                  instructorId,

                free_course_id:
                  freeCourse!.id,

                status: 'active',

                order: 999 + count,
              },
            });
        }

        /*
         * Chapter Item
         */

        const itemCount =
          await tx.free_course_chapter_items.count({
            where: {
              chapter_id:
                chapter.id,
            },
          });

        const chapterItem =
          await tx.free_course_chapter_items.create({
            data: {
              chapter_id:
                chapter.id,

              instructor_id:
                instructorId,

              type: 'live',

              order:
                itemCount + 1,
            },
          });

        /*
         * Lesson
         */

        const lessonTitle =
          dto.title;

const lesson =
  await tx.free_course_chapter_lessons.create({
    data: {
      title: lessonTitle,

      slug:
        `${this.slugify(lessonTitle)}-${this.randomString(6)}`,

      description:
        dto.description ?? null,

      free_course_id:
        freeCourse!.id,

      chapter_id:
        chapter.id,

      chapter_item_id:
        chapterItem.id,

      instructor_id:
        instructorId,

      storage: 'live',

      file_type: 'other',

      duration:
        String(dto.duration),
    },
  });

        courseLiveClassData.free_lesson_id =
          lesson.id;
      } else {
        /*
         * ---------------------------------------
         * JITSI / PAID COURSE
         * ---------------------------------------
         */

        let chapter =
          await tx.course_chapters.findFirst({
            where: {
              course_id:
                course!.id,

              title: 'Live Classes',
            },
          });

        if (!chapter) {
          const count =
            await tx.course_chapters.count({
              where: {
                course_id:
                  course!.id,
              },
            });

          chapter =
            await tx.course_chapters.create({
              data: {
                title: 'Live Classes',

                instructor_id:
                  instructorId,

                course_id:
                  course!.id,

                status: 'active',

                order: 999 + count,
              },
            });
        }

        /*
         * Chapter Item
         */

        const itemCount =
          await tx.course_chapter_items.count({
            where: {
              chapter_id:
                chapter.id,
            },
          });

        const chapterItem =
          await tx.course_chapter_items.create({
            data: {
              chapter_id:
                chapter.id,

              instructor_id:
                instructorId,

              type: 'live',

              order:
                itemCount + 1,
            },
          });

        /*
         * Lesson
         */

        const lessonTitle =
          dto.title;

        const lesson =
          await tx.course_chapter_lessons.create({
            data: {
              title:
                lessonTitle,

              description:
                dto.description ?? null,

              course_id:
                course!.id,

              chapter_id:
                chapter.id,

              chapter_item_id:
                chapterItem.id,

              instructor_id:
                instructorId,

              storage: 'live',

              file_type: 'live',

              duration:
                String(dto.duration),
            },
          });

        courseLiveClassData.lesson_id =
          lesson.id;
      }

      /*
       * ---------------------------------------
       * COURSE LIVE CLASS
       * ---------------------------------------
       */

      const courseLiveClass =
        await tx.course_live_classes.create({
          data: courseLiveClassData,
        });

      /*
       * ---------------------------------------
       * RESPONSE
       * ---------------------------------------
       */

      return this.serialize({
        status: 'success',

        message:
          'Live class scheduled successfully.',

        data: {
          live_class: liveClass,
          course_live_class:
            courseLiveClass,
        },
      });
    },
  );
}


private randomString(length: number): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result +=
      chars.charAt(
        Math.floor(
          Math.random() * chars.length,
        ),
      );
  }

  return result.toLowerCase();
}

private slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

private parseTimeToDate(
  time: string,
): Date {
  const parts = time
    .split(':')
    .map(Number);

  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;

  return new Date(
    1970,
    0,
    1,
    hours,
    minutes,
    seconds,
    0,
  );
}

private formatDateTime(
  value: Date | string | null,
): string | null {
  if (!value) {
    return null;
  }

  return new Date(value)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
}
}