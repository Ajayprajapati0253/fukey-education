import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(page = 1, limit = 15) {
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      this.prisma.admins.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      }),

      this.prisma.admins.count(),
    ]);

    return {
      data: admins.map((admin) => ({
        ...admin,
        id: admin.id.toString(),
      })),
      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admins.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return {
      ...admin,
      id: admin.id.toString(),
    };
  }

  async create(dto: CreateAdminDto) {
    const existingAdmin =
      await this.prisma.admins.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingAdmin) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      12,
    );

    const admin = await this.prisma.admins.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        status: dto.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      message: 'Admin created successfully',
      admin: {
        ...admin,
        id: admin.id.toString(),
      },
    };
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
  ) {
    const admin = await this.prisma.admins.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Laravel prevents modification of admin ID 1
    if (admin.id === BigInt(1)) {
      throw new ForbiddenException(
        'This admin cannot be modified',
      );
    }

    const emailOwner =
      await this.prisma.admins.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (
      emailOwner &&
      emailOwner.id !== BigInt(id)
    ) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const data: any = {
      name: dto.name,
      email: dto.email,
      status: dto.status,
      updated_at: new Date(),
    };

    if (dto.password) {
      data.password = await bcrypt.hash(
        dto.password,
        12,
      );
    }

    const updatedAdmin =
      await this.prisma.admins.update({
        where: {
          id: BigInt(id),
        },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });

    return {
      message: 'Admin updated successfully',
      admin: {
        ...updatedAdmin,
        id: updatedAdmin.id.toString(),
      },
    };
  }

  async remove(id: string) {
    const admin = await this.prisma.admins.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Same as Laravel:
    // abort_if($admin->id == 1, 403);
    if (admin.id === BigInt(1)) {
      throw new ForbiddenException(
        'This admin cannot be deleted',
      );
    }

    await this.prisma.admins.delete({
      where: {
        id: BigInt(id),
      },
    });

    return {
      message: 'Admin deleted successfully',
    };
  }

  async changeStatus(id: string) {
    const admin = await this.prisma.admins.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.id === BigInt(1)) {
      throw new ForbiddenException(
        'This admin cannot be modified',
      );
    }

    const status =
      admin.status === 'active'
        ? 'inactive'
        : 'active';

    await this.prisma.admins.update({
      where: {
        id: BigInt(id),
      },
      data: {
        status,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Updated Successfully',
      status,
    };
  }
}