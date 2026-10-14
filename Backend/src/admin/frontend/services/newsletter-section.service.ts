import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class NewsletterSectionService {
  private readonly sectionName = 'newsletter_section';
  private readonly homeSlug = 'main';
  private readonly uploadPath = 'uploads/custom-images';

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async index() {
    const home =
      await this.prisma.homes.findUnique({
        where: {
          slug: this.homeSlug,
        },
      });

    if (!home) {
      return {
        newsletter: null,
      };
    }

    const newsletter =
      await this.prisma.sections.findFirst({
        where: {
          home_id: home.id,
          name: this.sectionName,
        },
      });

    return {
      newsletter,
    };
  }

  async update(
    image?: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException(
        'The image is required.',
      );
    }

    const home =
      await this.prisma.homes.upsert({
        where: {
          slug: this.homeSlug,
        },
        update: {},
        create: {
          slug: this.homeSlug,
        },
      });

    const section =
      await this.prisma.sections.findFirst({
        where: {
          home_id: home.id,
          name: this.sectionName,
        },
      });

    const existingGlobalContent =
      (section?.global_content as Record<
        string,
        any
      >) ?? {};

    const globalContent = {
      ...existingGlobalContent,
      image: `${this.uploadPath}/${image.filename}`,
    };

    let updatedSection;

    if (section) {
      updatedSection =
        await this.prisma.sections.update({
          where: {
            id: section.id,
          },
          data: {
            global_content: globalContent,
          },
        });
    } else {
      updatedSection =
        await this.prisma.sections.create({
          data: {
            home_id: home.id,
            name: this.sectionName,
            global_content: globalContent,
            status: true,
          },
        });
    }

    return {
      success: true,
      newsletter: updatedSection,
    };
  }
}