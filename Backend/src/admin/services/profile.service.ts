import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateAdminProfileDto } from '../dto/update-admin-profile.dto';
import { UpdateAdminPasswordDto } from '../dto/update-admin-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get logged-in admin profile
   *
   * Laravel equivalent:
   * Auth::guard('admin')->user()
   */
  async getProfile(adminId: string) {
    const admin =
      await this.prisma.admins.findUnique({
        where: {
          id: BigInt(adminId),
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
      throw new NotFoundException(
        'Admin not found',
      );
    }

    return {
      id: admin.id.toString(),
      name: admin.name,
      email: admin.email,
      image: admin.image,
      bio: admin.bio,
      status: admin.status,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };
  }

  /**
   * Update logged-in admin profile
   */
  async updateProfile(
    adminId: string,
    dto: UpdateAdminProfileDto,
    image?: string,
  ) {
    const admin =
      await this.prisma.admins.findUnique({
        where: {
          id: BigInt(adminId),
        },
      });

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
      );
    }

    const existingAdmin =
      await this.prisma.admins.findFirst({
        where: {
          email: dto.email,
          NOT: {
            id: admin.id,
          },
        },
      });

    if (existingAdmin) {
      throw new ConflictException(
        'Email already exist',
      );
    }

    const updatedAdmin =
      await this.prisma.admins.update({
        where: {
          id: admin.id,
        },
        data: {
          name: dto.name,
          email: dto.email,
          bio: dto.bio ?? null,
          ...(image !== undefined
            ? { image }
            : {}),
          updated_at: new Date(),
        },
      });

    return {
      message: 'Profile updated successfully',
      admin: {
        id: updatedAdmin.id.toString(),
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        image: updatedAdmin.image,
        bio: updatedAdmin.bio,
        status: updatedAdmin.status,
      },
    };
  }

  /**
   * Update logged-in admin password
   */
  async updatePassword(
    adminId: string,
    dto: UpdateAdminPasswordDto,
  ) {
    if (
      dto.password !==
      dto.password_confirmation
    ) {
      throw new UnauthorizedException(
        'Confirm password does not match',
      );
    }

    const admin =
      await this.prisma.admins.findUnique({
        where: {
          id: BigInt(adminId),
        },
      });

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
      );
    }

    const currentPasswordValid =
      await bcrypt.compare(
        dto.current_password,
        admin.password.startsWith('$2y$')
          ? '$2b$' +
            admin.password.substring(4)
          : admin.password,
      );

    if (!currentPasswordValid) {
      throw new UnauthorizedException(
        'Current password does not match',
      );
    }

    const hashedPassword =
      await bcrypt.hash(dto.password, 12);

    await this.prisma.admins.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }
}