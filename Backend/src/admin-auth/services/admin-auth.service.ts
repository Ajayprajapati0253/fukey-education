import {
    BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';


import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.admins.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid Email');
    }

    if (admin.status !== 'active') {
      throw new UnauthorizedException('Inactive account');
    }

        const hash = admin.password;

            console.log('Password hash prefix:', hash.substring(0, 10));
            console.log('Password hash length:', hash.length);

const compatibleHash = admin.password.startsWith('$2y$')
  ? '$2b$' + admin.password.substring(4)
  : admin.password;

const passwordValid = await bcrypt.compare(
  dto.password,
  compatibleHash,
);

if (!passwordValid) {
  throw new UnauthorizedException('Invalid Password');
}
console.log('Password valid:', passwordValid);


    const payload = {
      sub: admin.id.toString(),
      email: admin.email,
      type: 'admin',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Logged in successfully.',
      access_token: accessToken,
      admin: {
        id: admin.id.toString(),
        name: admin.name,
        email: admin.email,
        image: admin.image,
        bio: admin.bio,
        status: admin.status,
      },
    };
  }

async resetPassword(
  adminId: string,
  dto: ResetPasswordDto,
) {
  if (dto.password !== dto.password_confirmation) {
    throw new BadRequestException(
      'Password confirmation does not match',
    );
  }

  const admin = await this.prisma.admins.findUnique({
    where: {
      id: BigInt(adminId),
    },
  });

  if (!admin) {
    throw new UnauthorizedException('Admin not found');
  }

  if (admin.status !== 'active') {
    throw new UnauthorizedException('Inactive account');
  }

  if (dto.email !== admin.email) {
    throw new UnauthorizedException('Invalid admin credentials');
  }

  const hashedPassword = await bcrypt.hash(
    dto.password,
    12,
  );

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
    message: 'Password reset successfully',
  };
}

async forgotPassword(dto: ForgotPasswordDto) {
  const admin = await this.prisma.admins.findUnique({
    where: {
      email: dto.email,
    },
  });

  // Don't reveal whether an email exists.
  if (!admin) {
    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  if (admin.status !== 'active') {
    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  const resetToken = randomBytes(32).toString('hex');

  await this.prisma.admins.update({
    where: {
      id: admin.id,
    },
    data: {
      forget_password_token: resetToken,
      updated_at: new Date(),
    },
  });

  // Email sending will be added once we confirm
  // your existing Laravel mail/reset-link implementation.

  return {
    message: 'Password reset link has been sent.',
  };
}

}