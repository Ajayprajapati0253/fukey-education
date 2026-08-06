import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    // User not found
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials please check your email and password',
      );
    }

    // Password check

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid credentials please check your email and password',
      );
    }

    // Active check

    if (user.status !== 'active') {
      throw new ForbiddenException('Inactive account');
    }

    // Ban check

    if (user.is_banned !== 'no') {
      throw new ForbiddenException('Your account has been banned');
    }

    // Email verification

    if (!user.email_verified_at) {
      throw new ForbiddenException('Please verify your email');
    }

    // FCM token update

    if (dto.fcmToken) {
      await this.prisma.users.update({
        where: {
          id: user.id,
        },

        data: {
          fcm_token: dto.fcmToken,
        },
      });
    }

    // JWT Generate

    const payload = {
      sub: user.id,

      email: user.email,

      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Logged in successfully',

      access_token: token,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },
    };
  }
}