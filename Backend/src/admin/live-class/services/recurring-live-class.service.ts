import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecurringLiveClassService {
  private readonly logger =
    new Logger(RecurringLiveClassService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generateRecurringLiveClasses() {
    /*
     * ----------------------------------------------------
     * Get recurring master live classes
     *
     * Same concept as Laravel:
     * is_recurring = 1
     * is_generated_instance = 0
     * ----------------------------------------------------
     */

    const masters =
      await this.prisma.course_live_classes.findMany({
        where: {
          is_recurring: true,
          is_generated_instance: false,
        },

        include: {
          course_chapter_lessons: true,
        },
      });

    let generated = 0;
    let skipped = 0;

    for (const master of masters) {
      try {
        const lesson =
          master.course_chapter_lessons;

        if (!lesson) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Recurring time
         * ------------------------------------------------
         */

        const recurringTime =
          this.extractTime(master.start_time);

        if (!recurringTime) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Recurring days
         * ------------------------------------------------
         */

        const recurringDays =
          this.parseRecurringDays(
            master.recurring_days,
          );

        if (recurringDays.length === 0) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Find next occurrence
         * ------------------------------------------------
         */

        const nextOccurrence =
          this.getNextOccurrence(
            recurringDays,
            recurringTime,
          );

        if (!nextOccurrence) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Check recurring end date
         * ------------------------------------------------
         */

        if (
          master.recurring_until &&
          nextOccurrence >
            master.recurring_until
        ) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Prevent duplicate occurrence
         * ------------------------------------------------
         */

        const formattedStart =
          this.formatDateTime(
            nextOccurrence,
          );

        const existing =
          await this.prisma.course_live_classes.findFirst(
            {
              where: {
                parent_live_class_id:
                  master.id,

                start_time:
                  formattedStart,
              },
            },
          );

        if (existing) {
          skipped++;
          continue;
        }

        /*
         * ------------------------------------------------
         * Create generated chapter item
         * ------------------------------------------------
         */

        const chapterItem =
          await this.prisma.course_chapter_items.create({
            data: {
              instructor_id:
                lesson.instructor_id,

              chapter_id:
                lesson.chapter_id,

              type: 'live',

              order: await this.getNextChapterItemOrder(
                lesson.chapter_id,
              ),

              created_at: new Date(),

              updated_at: new Date(),
            },
          });

        /*
         * ------------------------------------------------
         * Create generated lesson
         * ------------------------------------------------
         */

        const generatedLesson =
          await this.prisma.course_chapter_lessons.create({
            data: {
              title:
                `${lesson.title} - ${this.formatDisplayDate(
                  nextOccurrence,
                )}`,

              description:
                lesson.description,

              instructor_id:
                lesson.instructor_id,

              course_id:
                lesson.course_id,

              chapter_id:
                lesson.chapter_id,

              chapter_item_id:
                chapterItem.id,

              duration:
                lesson.duration,

              storage: 'live',

              file_type: 'live',

              downloadable: false,

              is_free:
                lesson.is_free ?? false,

              status: 'active',

              created_at: new Date(),

              updated_at: new Date(),
            },
          });

        /*
         * ------------------------------------------------
         * Create generated live class
         * ------------------------------------------------
         */

        await this.prisma.course_live_classes.create({
          data: {
            lesson_id:
              generatedLesson.id,

            start_time:
              formattedStart,

            type:
              master.type,

            is_recurring: false,

            recurring_days:
              undefined,

            recurring_type:
              null,

            recurring_interval: 1,

            recurring_until:
              null,

            parent_live_class_id:
              master.id,

            is_generated_instance:
              true,

            meeting_id:
              this.generateMeetingId(),

            password:
              master.password,

            join_url:
              master.join_url,

            created_at: new Date(),

            updated_at: new Date(),
          },
        });

        generated++;

        this.logger.log(
          `Generated recurring live class for master ${master.id} at ${formattedStart}`,
        );
      } catch (error) {
        skipped++;

        this.logger.error(
          `Failed to generate recurring live class for master ${master.id}`,
          error,
        );
      }
    }

    return {
      generated,
      skipped,
    };
  }

  private parseRecurringDays(
    value: unknown,
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (day): day is string =>
          typeof day === 'string',
      )
      .map((day) =>
        day.toLowerCase(),
      );
  }

  private extractTime(
    value: string | null,
  ): string | null {
    if (!value) {
      return null;
    }

    /*
     * Handles:
     * 20:00:00
     * 2026-09-15 20:00:00
     * ISO datetime
     */

    if (
      /^\d{2}:\d{2}:\d{2}$/.test(value)
    ) {
      return value;
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return [
      String(date.getHours()).padStart(
        2,
        '0',
      ),
      String(date.getMinutes()).padStart(
        2,
        '0',
      ),
      String(date.getSeconds()).padStart(
        2,
        '0',
      ),
    ].join(':');
  }

  private getNextOccurrence(
    recurringDays: string[],
    recurringTime: string,
  ): Date | null {
    const dayMap: Record<
      string,
      number
    > = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    const now = new Date();

    /*
     * Check today + next 7 days.
     */

    for (let offset = 0; offset <= 7; offset++) {
      const candidate =
        new Date(now);

      candidate.setDate(
        candidate.getDate() + offset,
      );

      const dayName =
        Object.keys(dayMap).find(
          (day) =>
            dayMap[day] ===
            candidate.getDay(),
        );

      if (
        !dayName ||
        !recurringDays.includes(
          dayName,
        )
      ) {
        continue;
      }

      const [
        hours,
        minutes,
        seconds,
      ] = recurringTime
        .split(':')
        .map(Number);

      candidate.setHours(
        hours || 0,
        minutes || 0,
        seconds || 0,
        0,
      );

      /*
       * Don't generate an occurrence
       * that has already started.
       */

      if (candidate <= now) {
        continue;
      }

      return candidate;
    }

    return null;
  }

  private async getNextChapterItemOrder(
    chapterId: bigint,
  ): Promise<number> {
    const result =
      await this.prisma.course_chapter_items.aggregate(
        {
          where: {
            chapter_id: chapterId,
          },

          _max: {
            order: true,
          },
        },
      );

    return (
      Number(
        result._max.order ?? 0,
      ) + 1
    );
  }

  private generateMeetingId(): string {
    const random =
      Math.random()
        .toString(36)
        .substring(2, 12);

    return `class-${random}`;
  }

  private formatDateTime(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    const hours =
      String(
        date.getHours(),
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes(),
      ).padStart(2, '0');

    const seconds =
      String(
        date.getSeconds(),
      ).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private formatDisplayDate(
    date: Date,
  ): string {
    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
  }
}