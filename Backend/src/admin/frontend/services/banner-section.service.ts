import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()

export class BannerSectionService {
  private readonly sectionName = 'banner_section';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateSection() {
    const home = await this.prisma.homes.findUnique({
      where: {
        slug: this.homeSlug,
      },
    });

    if (!home) {
      throw new NotFoundException('Main home not found');
    }

    let section = await this.prisma.sections.findFirst({
      where: {
        home_id: home.id,
        name: this.sectionName,
      },
    });

    if (!section) {
      section = await this.prisma.sections.create({
        data: {
          home_id: home.id,
          name: this.sectionName,
        },
      });
    }

    return section;
  }

  async get() {
    const section = await this.getOrCreateSection();

    return {
      success: true,
      data: {
        section: {
          id: section.id,
          name: section.name,
          global_content: section.global_content,
        },
      },
    };
  }

  async update(data: {
    video_url?: string;
    instructor_image?: string;
    student_image?: string;
    bg_image?: string;
  }) {
    const section = await this.getOrCreateSection();

    const oldGlobalContent =
      (section.global_content as Prisma.JsonObject | null) ?? {};

    const globalContent: Record<string, any> = {
      ...oldGlobalContent,
    };

    /*
     * Laravel:
     *
     * updateSectionContent(
     *     $section?->global_content,
     *     $request,
     *     ['video_url'],
     *     ['instructor_image', 'student_image', 'bg_image']
     * );
     */

    if (data.video_url !== undefined) {
      globalContent.video_url = data.video_url;
    }

    if (data.instructor_image !== undefined) {
      globalContent.instructor_image =
        `${this.uploadPath}/${data.instructor_image}`;
    }

    if (data.student_image !== undefined) {
      globalContent.student_image =
        `${this.uploadPath}/${data.student_image}`;
    }

    if (data.bg_image !== undefined) {
      globalContent.bg_image =
        `${this.uploadPath}/${data.bg_image}`;
    }

    await this.prisma.sections.update({
      where: {
        id: section.id,
      },
      data: {
        global_content:
          globalContent as Prisma.InputJsonValue,
        updated_at: new Date(),
      },
    });

    return this.get();
  }
}