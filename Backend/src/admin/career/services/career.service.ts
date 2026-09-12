import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCareerDto } from '../dto/create-career.dto';
import { UpdateCareerDto } from '../dto/update-career.dto';

@Injectable()
export class CareerService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async generateUniqueSlug(title: string) {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let count = 1;

    while (
      await this.prisma.careers.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  async findAll(
    page = 1,
    limit = 20,
    keyword?: string,
    department?: string,
    location?: string,
    employment_type?: string,
    status?: string,
    order_by?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (keyword) {
      where.title = {
        contains: keyword,
      };
    }

    if (department) {
      where.department = department;
    }

    if (location) {
      where.location = location;
    }

    if (employment_type) {
      where.employment_type = employment_type;
    }

    if (status) {
      where.status = status;
    }

    const order = order_by === 1 ? 'asc' : 'desc';

    const [total, careers, departments, locations] =
      await this.prisma.$transaction([
        this.prisma.careers.count({ where }),

        this.prisma.careers.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            id: order,
          },
        }),

        this.prisma.careers.findMany({
          where: {
            department: {
              not: null,
            },
          },
          distinct: ['department'],
          select: {
            department: true,
          },
        }),

        this.prisma.careers.findMany({
          where: {
            location: {
              not: null,
            },
          },
          distinct: ['location'],
          select: {
            location: true,
          },
        }),
      ]);

    return {
      status: 'success',
      data: careers.map((career) => ({
        ...career,
        id: career.id.toString(),
      })),
      departments: departments.map(
        (item) => item.department,
      ),
      locations: locations.map(
        (item) => item.location,
      ),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page:
          total > 0
            ? Math.ceil(total / limit)
            : 0,
      },
    };
  }

  async findOne(id: string) {
    const career = await this.prisma.careers.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    return {
      status: 'success',
      data: {
        ...career,
        id: career.id.toString(),
      },
    };
  }

  async create(dto: CreateCareerDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    const career = await this.prisma.careers.create({
      data: {
        title: dto.title,
        slug,
        department: dto.department ?? null,
        location: dto.location ?? null,
        employment_type: dto.employment_type ?? null,
        experience: dto.experience ?? null,
        salary: dto.salary ?? null,
        vacancies: dto.vacancies ?? 1,
        description: dto.description ?? null,
        requirements: dto.requirements ?? null,
        responsibilities:
          dto.responsibilities ?? null,
        benefits: dto.benefits ?? null,
        status: dto.status as any,
        is_featured: dto.is_featured ?? false,
        is_urgent: dto.is_urgent ?? false,
        is_remote: dto.is_remote ?? false,
        published_at:
          dto.status === 'published'
            ? dto.published_at
              ? new Date(dto.published_at)
              : new Date()
            : dto.published_at
              ? new Date(dto.published_at)
              : null,
      },
    });

    return {
      status: 'success',
      message: 'Career created successfully',
      data: {
        ...career,
        id: career.id.toString(),
      },
    };
  }

  async update(
    id: string,
    dto: UpdateCareerDto,
  ) {
    const careerId = BigInt(id);

    const existing =
      await this.prisma.careers.findUnique({
        where: {
          id: careerId,
        },
      });

    if (!existing) {
      throw new NotFoundException('Career not found');
    }

    const data: any = {
      ...(dto.title !== undefined && {
        title: dto.title,
      }),
      ...(dto.department !== undefined && {
        department: dto.department,
      }),
      ...(dto.location !== undefined && {
        location: dto.location,
      }),
      ...(dto.employment_type !== undefined && {
        employment_type: dto.employment_type,
      }),
      ...(dto.experience !== undefined && {
        experience: dto.experience,
      }),
      ...(dto.salary !== undefined && {
        salary: dto.salary,
      }),
      ...(dto.vacancies !== undefined && {
        vacancies: dto.vacancies,
      }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.requirements !== undefined && {
        requirements: dto.requirements,
      }),
      ...(dto.responsibilities !== undefined && {
        responsibilities: dto.responsibilities,
      }),
      ...(dto.benefits !== undefined && {
        benefits: dto.benefits,
      }),
      ...(dto.status !== undefined && {
        status: dto.status,
      }),
      ...(dto.is_featured !== undefined && {
        is_featured: dto.is_featured,
      }),
      ...(dto.is_urgent !== undefined && {
        is_urgent: dto.is_urgent,
      }),
      ...(dto.is_remote !== undefined && {
        is_remote: dto.is_remote,
      }),
      ...(dto.published_at !== undefined && {
        published_at: new Date(dto.published_at),
      }),
    };

    if (
      dto.status === 'published' &&
      !existing.published_at &&
      dto.published_at === undefined
    ) {
      data.published_at = new Date();
    }

    const updated = await this.prisma.careers.update({
      where: {
        id: careerId,
      },
      data,
    });

    return {
      status: 'success',
      message: 'Career updated successfully',
      data: {
        ...updated,
        id: updated.id.toString(),
      },
    };
  }

  async remove(id: string) {
    const careerId = BigInt(id);

    const career =
      await this.prisma.careers.findUnique({
        where: {
          id: careerId,
        },
      });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    await this.prisma.careers.delete({
      where: {
        id: careerId,
      },
    });

    return {
      status: 'success',
      message: 'Deleted Successfully',
    };
  }

  async statusUpdate(
    id: string,
    status?: 'draft' | 'published' | 'closed',
  ) {
    const careerId = BigInt(id);

    const career =
      await this.prisma.careers.findUnique({
        where: {
          id: careerId,
        },
      });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    let newStatus = status;

    if (
      !newStatus ||
      !['draft', 'published', 'closed'].includes(
        newStatus,
      )
    ) {
      newStatus =
        career.status === 'published'
          ? 'closed'
          : 'published';
    }

    const updated =
      await this.prisma.careers.update({
        where: {
          id: careerId,
        },
        data: {
          status: newStatus as any,
        },
      });

    return {
      success: true,
      message: 'Updated Successfully',
      status: updated.status,
    };
  }
}