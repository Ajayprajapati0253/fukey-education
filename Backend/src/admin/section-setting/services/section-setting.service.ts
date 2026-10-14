
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSectionSettingDto } from '../dto/update-section-setting.dto';

@Injectable()
export class SectionSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    const setting = await this.prisma.section_settings.findUnique({
      where: { id: BigInt(1) },
    });

    if (!setting) {
      return null;
    }

    return {
      ...setting,
      id: setting.id.toString(),
    };
  }

  async update(dto: UpdateSectionSettingDto) {
    const fields = [
      'hero_section',
      'top_category_section',
      'brands_section',
      'about_section',
      'gallery_section',
      'featured_course_section',
      'news_letter_section',
      'featured_instructor_section',
      'counter_section',
      'faq_section',
      'our_features_section',
      'testimonial_section',
      'banner_section',
      'latest_blog_section',
      'blog_page',
      'about_page',
      'contact_page',
    ] as const;

    // Laravel: $request->has(field)
    // Every submitted request sets missing checkboxes to false.
    const data = Object.fromEntries(
      fields.map((field) => [field, dto[field] === true]),
    );

    const setting = await this.prisma.section_settings.upsert({
      where: { id: BigInt(1) },
      create: {
        id: BigInt(1),
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        ...data,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Updated successfully',
      data: {
        ...setting,
        id: setting.id.toString(),
      },
    };
  }
}
