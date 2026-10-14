
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSocialLinkDto } from '../dto/create-social-link.dto';
import { UpdateSocialLinkDto } from '../dto/update-social-link.dto';

@Injectable()
export class SocialLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 25) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 25));

    const [data, total] = await this.prisma.$transaction([
      this.prisma.social_links.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.social_links.count(),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: bigint) {
    const socialLink = await this.prisma.social_links.findUnique({
      where: { id },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    return { success: true, data: socialLink };
  }

  async create(dto: CreateSocialLinkDto, icon: string) {
    const socialLink = await this.prisma.social_links.create({
      data: {
        link: dto.link,
        icon,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Social link created successfully',
      data: socialLink,
    };
  }

  async update(
    id: bigint,
    dto: UpdateSocialLinkDto,
    icon?: string,
  ) {
    await this.findOne(id);

    const socialLink = await this.prisma.social_links.update({
      where: { id },
      data: {
        ...(dto.link !== undefined && { link: dto.link }),
        ...(icon !== undefined && { icon }),
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Social link updated successfully',
      data: socialLink,
    };
  }

  async remove(id: bigint) {
    await this.findOne(id);

    await this.prisma.social_links.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Social link deleted successfully',
    };
  }
}
