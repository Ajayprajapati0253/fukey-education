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

    // Check credentials
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials please check your email and password');
    }

    // Ban check
    if (user.is_banned !== 'no') {
      throw new ForbiddenException('Your account has been banned');
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      redirectTo: user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard',
    };
  }
}