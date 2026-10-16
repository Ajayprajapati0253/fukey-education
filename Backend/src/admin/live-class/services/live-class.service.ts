import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateLiveClassDto } from '../dto/create-live-class.dto';
import { UpdateLiveClassDto } from '../dto/update-live-class.dto';
import { JitsiService } from './jitsi.service';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class LiveClassService {
private readonly logger = new Logger(LiveClassService.name);

private readonly s3: S3Client;

constructor(
  private readonly prisma: PrismaService,
  private readonly jitsiService: JitsiService,
  private readonly configService: ConfigService,
) {
  
this.s3 = new S3Client({
  region: this.configService.getOrThrow<string>('RECORDING_AWS_REGION'),
  credentials: {
    accessKeyId: this.configService.getOrThrow<string>(
      'RECORDING_AWS_ACCESS_KEY_ID',
    ),
    secretAccessKey: this.configService.getOrThrow<string>(
      'RECORDING_AWS_SECRET_ACCESS_KEY',
    ),
  },
});

}


async findAll() {
  const liveClasses =
    await this.prisma.live_classes.findMany({
      orderBy: {
        start_time: 'desc',
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            job_title: true,
          },
        },

        courses: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

  // Get free course IDs
  const freeCourseIds = [
    ...new Set(
      liveClasses
        .map((item) => item.free_course_id)
        .filter(
          (id): id is bigint =>
            id !== null && id !== undefined,
        ),
    ),
  ];

  // Fetch free courses separately because
  // live_classes currently has no Prisma relation
  const freeCourses =
    freeCourseIds.length > 0
      ? await this.prisma.free_courses.findMany({
          where: {
            id: {
              in: freeCourseIds,
            },
          },
          select: {
            id: true,
            title: true,
          },
        })
      : [];

  const freeCourseMap = new Map(
    freeCourses.map((course) => [
      course.id.toString(),
      course,
    ]),
  );

  const data = liveClasses.map((item) => {
    const freeCourse = item.free_course_id
      ? freeCourseMap.get(
          item.free_course_id.toString(),
        )
      : null;

    return {
      ...item,

      instructor_name:
        item.users?.name ?? null,

      instructor_avatar:
        item.users?.image ?? null,

      instructor_email:
        item.users?.email ?? null,

      instructor_specialty:
        item.users?.job_title ?? null,

      course_name:
        item.courses?.title ?? null,

      free_course_name:
        freeCourse?.title ?? null,
    };
  });

  console.log(data);

  return {
    status: 'success',
    data: this.serialize(data),
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

    const meetingId =
      this.jitsiService.generateMeetingId();

    const meetingUrl =
      platform === 'jitsi'
        ? this.jitsiService.generateMeetingUrl(meetingId)
        : null;

    let moderatorToken: string | null = null;
let moderatorUrl: string | null = null;

const isRecurring =
  Array.isArray(dto.recurring_days) &&
  dto.recurring_days.length > 0;

if (platform === 'jitsi') {
  moderatorToken = this.jitsiService.generateJwt(
    {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
    },
    {
      is_recurring: isRecurring,
      recurring_time: dto.recurring_time
        ? new Date(`1970-01-01T${dto.recurring_time}`)
        : null,
      start_time: new Date(dto.start_time!),
      duration: dto.duration,
      meeting_id: meetingId,
    },
    true,
  );

  moderatorUrl = `${meetingUrl}?jwt=${moderatorToken}`;
}
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

                moderator_token: moderatorToken,

                moderator_url: moderatorUrl,

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

                recurring_time:
                  dto.recurring_time
                    ? new Date(`1970-01-01T${dto.recurring_time}`)
                    : null,

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
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  if (!liveClass) {
    throw new NotFoundException(
      'Live class not found.',
    );
  }

  const recordings =
    await this.prisma.lesson_recordings.findMany({
      where: {
        meeting_id: liveClass.meeting_id,
      },
      orderBy: {
        recorded_at: 'desc',
      },
      select: {
        id: true,
        meeting_id: true,
        file_path: true,
        recorded_at: true,
        duration: true,
        file_size: true,
        recording_title: true,
      },
    });

  let instructorUrl: string | null = null;

  if (liveClass.platform === 'jitsi') {
    const token =
      this.jitsiService.generateJwt(
        {
          id: liveClass.users.id,
          name: liveClass.users.name,
          email: liveClass.users.email,
        },
        {
          is_recurring: liveClass.is_recurring,
          recurring_time:
            liveClass.recurring_time,
          start_time: liveClass.start_time,
          duration: liveClass.duration,
          meeting_id: liveClass.meeting_id,
        },
        true,
      );

    instructorUrl =
      `${liveClass.meeting_url}?jwt=${token}`;
  }

  return {
    status: 'success',
    data: this.serialize({
      ...liveClass,
      instructor_url: instructorUrl,
      recordings,
    }),
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

async attachRecordings() {
  const bucket = this.configService.get<string>(
    'RECORDING_AWS_S3_BUCKET',
  );

  if (!bucket) {
    throw new Error(
      'RECORDING_AWS_S3_BUCKET is missing in .env',
    );
  }

  let continuationToken: string | undefined;
  const objects: Array<{
    key: string;
    size: number;
    lastModified?: Date;
  }> = [];

  // 1. Recordings ke saare S3 objects list karo
  do {
    const response = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'recordings/',
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        objects.push({
          key: object.Key,
          size: object.Size ?? 0,
          lastModified: object.LastModified,
        });
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  const metadataFiles = objects.filter((object) =>
    object.key.endsWith('/metadata.json'),
  );

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // 2. Har recording folder ka metadata read karo
  for (const metadataFile of metadataFiles) {
    const folderPrefix = metadataFile.key.slice(
      0,
      -'metadata.json'.length,
    );

    try {
      const metadataResponse = await this.s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: metadataFile.key,
        }),
      );

      const metadataText =
        await metadataResponse.Body?.transformToString();

      if (!metadataText) {
        skipped++;
        continue;
      }

      const metadata = JSON.parse(metadataText);

      const meetingUrl = metadata.meeting_url;

      if (
        typeof meetingUrl !== 'string' ||
        !meetingUrl.trim()
      ) {
        this.logger.warn(
          `meeting_url missing in ${metadataFile.key}`,
        );
        skipped++;
        continue;
      }

      // 3. URL se meeting room nikalo
      let room: string;

      try {
        room = new URL(meetingUrl).pathname
          .split('/')
          .filter(Boolean)
          .pop()!
          .trim()
          .toLowerCase();
      } catch {
        room = meetingUrl
          .split('/')
          .filter(Boolean)
          .pop()!
          .trim()
          .toLowerCase();
      }

      if (!room) {
        skipped++;
        continue;
      }

      // 4. Matching course live class aur original lesson find karo
      const liveClasses =
        await this.prisma.course_live_classes.findMany({
          where: {
            meeting_id: { not: null },
            lesson_id: { not: null },
          },
          include: {
            course_chapter_lessons: true,
          },
          orderBy: {
            id: 'desc',
          },
        });

      const matchingLiveClass = liveClasses.find(
        (item) =>
          item.meeting_id?.trim().toLowerCase() === room &&
          item.course_chapter_lessons,
      );

      if (!matchingLiveClass?.course_chapter_lessons) {
        this.logger.warn(
          `No course lesson found for meeting: ${room}`,
        );
        skipped++;
        continue;
      }

      const template =
        matchingLiveClass.course_chapter_lessons;

      // 5. Is folder ke MP4 recordings process karo
      const mp4Files = objects.filter(
        (object) =>
          object.key.startsWith(folderPrefix) &&
          object.key.toLowerCase().endsWith('.mp4'),
      );

      for (const mp4 of mp4Files) {
        try {
          // Duplicate recording skip karo
          const existing =
            await this.prisma.lesson_recordings.findUnique({
              where: {
                file_path: mp4.key,
              },
            });

          if (existing) {
            skipped++;
            continue;
          }

          // Original chapter ke andar next order nikalo
          await this.prisma.$transaction(async (tx) => {
            const lastItem =
              await tx.course_chapter_items.findFirst({
                where: {
                  chapter_id: template.chapter_id,
                },
                orderBy: {
                  order: 'desc',
                },
                select: {
                  order: true,
                },
              });

            const nextOrder = (lastItem?.order ?? -1) + 1;
            const now = new Date();

            // New chapter item
            const chapterItem =
              await tx.course_chapter_items.create({
                data: {
                  instructor_id: template.instructor_id,
                  chapter_id: template.chapter_id,
                  type: 'lesson',
                  order: nextOrder,
                  created_at: now,
                  updated_at: now,
                },
              });

            // New recorded-video lesson
            const lesson =
              await tx.course_chapter_lessons.create({
                data: {
                  title: template.title,
                  description: template.description,
                  instructor_id: template.instructor_id,
                  course_id: template.course_id,
                  chapter_id: template.chapter_id,
                  chapter_item_id: chapterItem.id,
                  file_path: mp4.key,
                  storage: 'aws',
                  file_type: 'video',
                  duration: template.duration,
                  downloadable: template.downloadable,
                  is_free: template.is_free,
                  status: 'active',
                  created_at: now,
                  updated_at: now,
                },
              });

            // Recording metadata save karo
            await tx.lesson_recordings.create({
              data: {
                lesson_id: lesson.id,
                meeting_id: matchingLiveClass.meeting_id!,
                file_path: mp4.key,
                recorded_at: mp4.lastModified ?? now,
                file_size: BigInt(mp4.size),
                live_class_id: null,
                course_id: template.course_id,
                instructor_id: template.instructor_id,
                recording_title: mp4.key
                  .split('/')
                  .pop()!
                  .replace(/\.mp4$/i, ''),
                created_at: now,
                updated_at: now,
              },
            });
          });

          created++;

          this.logger.log(
            `Recording attached: ${mp4.key}`,
          );
        } catch (error) {
          errors++;

          this.logger.error(
            `Failed to attach ${mp4.key}: ${
              error instanceof Error
                ? error.message
                : String(error)
            }`,
          );
        }
      }
    } catch (error) {
      errors++;

      this.logger.error(
        `Failed to process ${metadataFile.key}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }
  }

  const summary = {
    totalMetadataFiles: metadataFiles.length,
    created,
    skipped,
    errors,
  };

  this.logger.log(
    `Recording attachment completed: ${JSON.stringify(summary)}`,
  );

  return summary;
}

async importRecordingFromWebhook(filePath: string) {
  const normalizedPath = filePath.trim();

  if (!normalizedPath) {
    throw new BadRequestException({
      status: false,
      message: 'file_path missing',
    });
  }

  // 1. Extract meeting ID from the recording filename.
  const filename = normalizedPath.split('/').pop() ?? '';

  const matches = filename.match(/(class-[^_]+)/i);
  const meetingId = (matches?.[1] ?? '').toLowerCase();

  if (!meetingId) {
    this.logger.warn(
      `Meeting ID not found in recording path: ${normalizedPath}`,
    );

    throw new BadRequestException({
      status: false,
      message: 'meeting id not found',
    });
  }

  // 2. Check whether this recording has already been imported.
  const existingRecording =
    await this.prisma.lesson_recordings.findUnique({
      where: {
        file_path: normalizedPath,
      },
    });

  if (existingRecording) {
    return {
      status: true,
      message: 'already imported',
    };
  }

  // 3. Find the latest matching live class.
  const liveClasses =
    await this.prisma.course_live_classes.findMany({
      where: {
        lesson_id: {
          not: null,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

  const liveClass =
    liveClasses.find(
      (item) =>
        item.meeting_id?.toLowerCase() === meetingId,
    ) ?? null;

  // 4. Find the template lesson.
  let templateLesson = liveClass?.lesson_id
    ? await this.prisma.course_chapter_lessons.findUnique({
        where: {
          id: liveClass.lesson_id,
        },
      })
    : null;

  // Fallback: find an older recording for the same meeting.
  if (!templateLesson) {
    const previousRecordings =
  await this.prisma.lesson_recordings.findMany({
    where: {
      lesson_id: {
        not: 0,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

const previousRecording =
  previousRecordings.find(
    (recording) =>
      recording.meeting_id?.toLowerCase() === meetingId,
  ) ?? null;

    if (previousRecording?.lesson_id) {
      templateLesson =
        await this.prisma.course_chapter_lessons.findUnique({
          where: {
            id: previousRecording.lesson_id,
          },
        });
    }
  }

  if (!templateLesson) {
    this.logger.warn(
      `Lesson mapping not found for meeting: ${meetingId}`,
    );

    throw new NotFoundException({
      status: false,
      message: 'mapping not found',
    });
  }

  // 5. Get recording size from S3.
  // If the object is unavailable, keep file_size null.
  let fileSize: bigint | null = null;

  try {
    const bucket = this.configService.getOrThrow<string>(
      'RECORDING_AWS_S3_BUCKET',
    );

    const headResponse = await this.s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: normalizedPath,
      }),
    );

    if (headResponse.ContentLength != null) {
      fileSize = BigInt(headResponse.ContentLength);
    }
  } catch (error) {
    this.logger.warn(
      `Could not retrieve S3 file size for ${normalizedPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // 6. Build a clean title from the template lesson title.
  let baseTitle = templateLesson.title ?? '';

  baseTitle = baseTitle
    .replace(/\s*-\s*Recording.*$/i, '')
    .replace(/\s*\(class-[^)]+\).*$/i, '')
    .trim()
    .replace(/^[\s-]+|[\s-]+$/g, '');

  if (!baseTitle) {
    baseTitle = templateLesson.title || 'Class Recording';
  }

  // 7. Create the chapter item, lesson and recording atomically.
  try {
    return await this.prisma.$transaction(async (tx) => {
      // Recheck inside the transaction to avoid duplicate imports.
      const duplicate = await tx.lesson_recordings.findUnique({
        where: {
          file_path: normalizedPath,
        },
      });

      if (duplicate) {
        return {
          status: true,
          message: 'already imported',
        };
      }

      const latestItem =
        await tx.course_chapter_items.aggregate({
          where: {
            chapter_id: templateLesson.chapter_id,
          },
          _max: {
            order: true,
          },
        });

      const nextOrder =
        (latestItem._max.order ?? 0) + 1;

      const chapterItem =
        await tx.course_chapter_items.create({
          data: {
            chapter_id: templateLesson.chapter_id,
            instructor_id: templateLesson.instructor_id,
            type: 'lesson',
            order: nextOrder,
          },
        });

      const lesson =
        await tx.course_chapter_lessons.create({
          data: {
            title: baseTitle,
            description: templateLesson.description,
            course_id: templateLesson.course_id,
            chapter_id: templateLesson.chapter_id,
            chapter_item_id: chapterItem.id,
            file_path: normalizedPath,
            storage: 'aws',
            file_type: 'video',
            duration: templateLesson.duration,
            instructor_id: templateLesson.instructor_id,
            is_free: templateLesson.is_free,
          },
        });

      await tx.lesson_recordings.create({
        data: {
          lesson_id: lesson.id,
          meeting_id: meetingId,
          file_path: normalizedPath,
          recorded_at: new Date(),
          file_size: fileSize,
          live_class_id: liveClass?.id ?? null,
          course_id: lesson.course_id,
          instructor_id: lesson.instructor_id,
          recording_title: lesson.title,
        },
      });

      this.logger.log(
        `Recording imported successfully: ${normalizedPath}`,
      );

      return {
        status: true,
        message: 'recording imported',
      };
    });
  } catch (error) {
    // A concurrent request may have inserted the same unique file_path.
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      const duplicate =
        await this.prisma.lesson_recordings.findUnique({
          where: {
            file_path: normalizedPath,
          },
        });

      if (duplicate) {
        return {
          status: true,
          message: 'already imported',
        };
      }
    }

    throw error;
  }
}
}