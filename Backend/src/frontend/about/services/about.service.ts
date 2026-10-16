import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  async getAboutPage() {
    const sectionNames = [
      'hero_section',
      'about_section',
      'about-learning',
      'about_affordable_education',
      'about_all_subjects',
      'hindi_english_batches',
      'our_purpose',
      'leadership',
      'our_features_section',
      'newsletter_section',
      'faq_section',
    ];

    const [sections, brands, testimonials, faqs] = await Promise.all([
      this.prisma.sections.findMany({
        where: {
          name: {
            in: sectionNames,
          },
          status: true,
        },
        include: {
          section_translations: true,
        },
        orderBy: {
          sort_order: 'asc',
        },
      }),

      this.prisma.brands.findMany({
        where: {
          status: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),

      this.prisma.testimonials.findMany({
        where: {
          status: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),

      this.prisma.faqs.findMany({
        where: {
          status: true,
        },
        include: {
          faq_translations: true,
        },
      }),
    ]);

    const sectionMap = Object.fromEntries(
      sections.map((section) => [
        section.name,
        {
          ...section,
          id: section.id.toString(),
          home_id: section.home_id.toString(),
        },
      ]),
    );

    return {
      status: true,
      message: 'About page data fetched successfully',
      data: {
        hero: sectionMap['hero_section'] ?? null,
        aboutSection: sectionMap['about_section'] ?? null,
        aboutLearningSection: sectionMap['about-learning'] ?? null,
        aboutAffordableEducationSection:
          sectionMap['about_affordable_education'] ?? null,
        aboutAllSubjectsSection:
          sectionMap['about_all_subjects'] ?? null,
        hindiEnglishBatches:
          sectionMap['hindi_english_batches'] ?? null,
        ourPurpose: sectionMap['our_purpose'] ?? null,
        leadership: sectionMap['leadership'] ?? null,
        ourFeatures: sectionMap['our_features_section'] ?? null,
        newsletterSection: sectionMap['newsletter_section'] ?? null,
        faqSection: sectionMap['faq_section'] ?? null,

        brands: brands.map((brand) => ({
          ...brand,
          id: brand.id.toString(),
        })),

        reviews: testimonials.map((testimonial) => ({
          ...testimonial,
          id: testimonial.id.toString(),
        })),

        faqs: faqs.map((faq) => ({
          ...faq,
          id: faq.id.toString(),
        })),
      },
    };
  }
}