import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDemoClassDto } from '../dto/create-demo-class.dto';
import { UpdateDemoClassDto } from '../dto/update-demo-class.dto';

@Injectable()
export class DemoClassService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const demoClasses = await this.prisma.demo_classes.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    const categoryIds = [
      ...new Set(
        demoClasses.map((item) => item.course_category_id.toString()),
      ),
    ].map((id) => BigInt(id));

    const categories =
      categoryIds.length > 0
        ? await this.prisma.course_categories.findMany({
            where: {
              id: {
                in: categoryIds,
              },
            },
          })
        : [];

    const categoryMap = new Map(
      categories.map((category) => [category.id.toString(), category]),
    );

    return {
      success: true,
      data: demoClasses.map((demoClass) => ({
        ...demoClass,
        id: demoClass.id.toString(),
        course_category_id: demoClass.course_category_id.toString(),
        category:
          categoryMap.get(demoClass.course_category_id.toString()) ?? null,
      })),
    };
  }

  async findOne(id: string) {
    const demoClass = await this.prisma.demo_classes.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!demoClass) {
      throw new NotFoundException('Demo class not found');
    }

    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: demoClass.course_category_id,
      },
    });

    return {
      success: true,
      data: {
        ...demoClass,
        id: demoClass.id.toString(),
        course_category_id: demoClass.course_category_id.toString(),
        category,
      },
    };
  }

  async create(dto: CreateDemoClassDto) {
    const categoryId = BigInt(dto.course_category_id);

    const category = await this.prisma.course_categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Course category does not exist');
    }

    const demoClass = await this.prisma.demo_classes.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        course_category_id: categoryId,
        language: dto.language,
        thumbnail: dto.thumbnail ?? null,
        video_url: dto.video_url,
        duration: dto.duration ?? null,
        is_active: dto.is_active,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Demo class created successfully',
      data: {
        ...demoClass,
        id: demoClass.id.toString(),
        course_category_id: demoClass.course_category_id.toString(),
      },
    };
  }

  async update(id: string, dto: UpdateDemoClassDto) {
    const demoClass = await this.prisma.demo_classes.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!demoClass) {
      throw new NotFoundException('Demo class not found');
    }

    let categoryId: bigint | undefined;

    if (dto.course_category_id !== undefined) {
      categoryId = BigInt(dto.course_category_id);

      const category = await this.prisma.course_categories.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        throw new BadRequestException('Course category does not exist');
      }
    }

    const updatedDemoClass = await this.prisma.demo_classes.update({
      where: {
        id: BigInt(id),
      },
      data: {
        ...(dto.title !== undefined && {
          title: dto.title,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(categoryId !== undefined && {
          course_category_id: categoryId,
        }),

        ...(dto.language !== undefined && {
          language: dto.language,
        }),

        ...(dto.thumbnail !== undefined && {
          thumbnail: dto.thumbnail,
        }),

        ...(dto.video_url !== undefined && {
          video_url: dto.video_url,
        }),

        ...(dto.duration !== undefined && {
          duration: dto.duration,
        }),

        ...(dto.is_active !== undefined && {
          is_active: dto.is_active,
        }),

        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Demo class updated successfully',
      data: {
        ...updatedDemoClass,
        id: updatedDemoClass.id.toString(),
        course_category_id:
          updatedDemoClass.course_category_id.toString(),
      },
    };
  }

  async remove(id: string) {
    const demoClass = await this.prisma.demo_classes.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!demoClass) {
      throw new NotFoundException('Demo class not found');
    }

    await this.prisma.demo_classes.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      success: true,
      message: 'Demo class deleted successfully',
    };
  }
}