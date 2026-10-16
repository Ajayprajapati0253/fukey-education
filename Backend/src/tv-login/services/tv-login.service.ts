import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TvLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    return Array.from(
      { length: 6 },
      () => chars[randomInt(chars.length)],
    ).join('');
  }

  async generate(body: {
    device_name?: string;
    device_model?: string;
  }) {
    let code = '';
    let created = false;

    while (!created) {
      code = this.generateCode();

      try {
        await this.prisma.tv_login_codes.create({
          data: {
            code,
            status: 'pending',
            expires_at: new Date(Date.now() + 5 * 60 * 1000),
            device_name: body.device_name ?? null,
            device_model: body.device_model ?? null,
          },
        });

        created = true;
      } catch (error: any) {
        if (error?.code !== 'P2002') {
          throw error;
        }
      }
    }

    return {
      success: true,
      code,
      url: `https://fukeyeducation.com/tv-login?code=${code}`,
      expires_in: 300,
    };
  }

  async status(code: string) {
    const tvLogin = await this.prisma.tv_login_codes.findUnique({
      where: { code },
    });

    if (!tvLogin) {
      return { status: 'invalid' };
    }

    if (tvLogin.status === 'consumed') {
      return { status: 'consumed' };
    }

    if (tvLogin.expires_at.getTime() <= Date.now()) {
      await this.prisma.tv_login_codes.update({
        where: { id: tvLogin.id },
        data: { status: 'expired' },
      });

      return { status: 'expired' };
    }

    if (tvLogin.status !== 'approved') {
      return { status: 'pending' };
    }

    if (!tvLogin.user_id) {
      return { status: 'invalid' };
    }

    const user = await this.prisma.users.findUnique({
      where: { id: tvLogin.user_id },
    });

    if (!user) {
      return { status: 'invalid' };
    }

    if (user.status !== 'active' || user.is_banned !== 'no') {
      throw new UnauthorizedException('Account is inactive or banned');
    }

    // Atomically consume the approved code so concurrent polls
    // cannot issue multiple tokens for the same TV login.
    const consumed = await this.prisma.tv_login_codes.updateMany({
      where: {
        id: tvLogin.id,
        status: 'approved',
        expires_at: { gt: new Date() },
      },
      data: { status: 'consumed' },
    });

    if (consumed.count !== 1) {
      return { status: 'consumed' };
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      status: 'approved',
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_completed: user.profile_completed,
      },
    };
  }

  async authorizeTv(code: string, userId: string) {
    const tvLogin = await this.prisma.tv_login_codes.findUnique({
      where: { code },
    });

    if (!tvLogin) {
      throw new NotFoundException({
        success: false,
        message: 'Invalid code',
      });
    }

    if (tvLogin.expires_at.getTime() <= Date.now()) {
      await this.prisma.tv_login_codes.update({
        where: { id: tvLogin.id },
        data: { status: 'expired' },
      });

      throw new BadRequestException({
        success: false,
        message: 'Code expired',
      });
    }

    if (tvLogin.status !== 'pending') {
      throw new ConflictException({
        success: false,
        message: 'Code is no longer pending',
      });
    }

    const userIdBigInt = BigInt(userId);

    const user = await this.prisma.users.findUnique({
      where: { id: userIdBigInt },
    });

    if (!user || user.role !== 'student') {
      throw new UnauthorizedException('Student account required');
    }

    if (user.status !== 'active' || user.is_banned !== 'no') {
      throw new UnauthorizedException('Account is inactive or banned');
    }

    const updated = await this.prisma.tv_login_codes.updateMany({
      where: {
        id: tvLogin.id,
        status: 'pending',
        expires_at: { gt: new Date() },
      },
      data: {
        user_id: userIdBigInt,
        status: 'approved',
      },
    });

    if (updated.count !== 1) {
      throw new ConflictException({
        success: false,
        message: 'Code expired or already authorized',
      });
    }

    return {
      success: true,
      message: 'TV authorized successfully',
    };
  }

  async deviceInfo(code: string) {
    const tvLogin = await this.prisma.tv_login_codes.findUnique({
      where: { code },
      select: {
        device_name: true,
        device_model: true,
      },
    });

    if (!tvLogin) {
      throw new NotFoundException({
        success: false,
        message: 'Invalid code',
      });
    }

    return {
      success: true,
      device_name: tvLogin.device_name,
      device_model: tvLogin.device_model,
    };
  }
}