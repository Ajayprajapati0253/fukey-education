
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateBioDto } from '../dto/update-bio.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateSocialLinksDto } from '../dto/update-social-links.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private async findUser(userId: string | number) {
    const user = await this.prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    return user;
  }

  private serializeUser(user: any) {
    const { password, ...safeUser } = user;

    return Object.fromEntries(
      Object.entries(safeUser).map(([key, value]) => [
        key,
        typeof value === 'bigint' ? value.toString() : value,
      ]),
    );
  }

  async getProfile(userId: string | number) {
    const user = await this.findUser(userId);

    return {
      status: 'success',
      data: this.serializeUser(user),
    };
  }

  async updateProfile(
    userId: string | number,
    dto: UpdateProfileDto,
  ) {
    const user = await this.findUser(userId);
    const id = BigInt(userId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
          id: { not: id },
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException({
          status: 'error',
          message: 'Email already exists',
        });
      }
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.users.findFirst({
        where: {
          phone: dto.phone,
          id: { not: id },
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException({
          status: 'error',
          message: 'Phone already exists',
        });
      }
    }

    const updated = await this.prisma.users.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.gender !== undefined && {
          gender: dto.gender as any,
        }),
        ...(dto.student_class !== undefined && {
          student_class: dto.student_class,
        }),
        ...(dto.board !== undefined && { board: dto.board }),
        ...(dto.school !== undefined && { school: dto.school }),
        ...(dto.language !== undefined && {
          language: dto.language,
        }),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(updated),
    };
  }

  async updateBio(
    userId: string | number,
    dto: UpdateBioDto,
  ) {
    await this.findUser(userId);

    const updated = await this.prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        job_title: dto.job_title,
        bio: dto.bio,
        short_bio: dto.short_bio,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(updated),
    };
  }

  async updatePassword(
    userId: string | number,
    dto: UpdatePasswordDto,
  ) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException({
        status: 'error',
        message: 'The password confirmation does not match.',
      });
    }

    const user = await this.findUser(userId);

    const validPassword = await bcrypt.compare(
      dto.current_password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'The current password is incorrect.',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
    };
  }

  async updateAddress(
    userId: string | number,
    dto: UpdateAddressDto,
  ) {
    await this.findUser(userId);

    const country = await this.prisma.countries.findUnique({
      where: { id: BigInt(dto.country_id) },
      select: { id: true },
    });

    if (!country) {
      throw new BadRequestException({
        status: 'error',
        message: 'The selected country is invalid.',
      });
    }

    const updated = await this.prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        country_id: BigInt(dto.country_id),
        state: dto.state ?? null,
        city: dto.city ?? null,
        address: dto.address ?? null,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(updated),
    };
  }

  async updateSocialLinks(
    userId: string | number,
    dto: UpdateSocialLinksDto,
  ) {
    await this.findUser(userId);

    const updated = await this.prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        facebook: dto.facebook ?? null,
        twitter: dto.twitter ?? null,
        website: dto.website ?? null,
        linkedin: dto.linkedin ?? null,
        github: dto.github ?? null,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: this.serializeUser(updated),
    };
  }

  async updateProfilePicture(
    userId: string | number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        status: 'error',
        message: 'The image is required.',
      });
    }

    await this.findUser(userId);

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        status: 'error',
        message: 'The image must be a valid image file.',
      });
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException({
        status: 'error',
        message: 'The image may not be greater than 2000 kilobytes.',
      });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const extensionByMime: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    const filename =
      `profile-${userId}-${Date.now()}` +
      extensionByMime[file.mimetype];

    writeFileSync(join(uploadDir, filename), file.buffer);

    const imagePath = `/uploads/profiles/${filename}`;

    const updated = await this.prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        image: imagePath,
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Updated Successfully',
      data: {
        image: updated.image,
      },
    };
  }
}
