import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from './enums/user-status.enum';
import { RecaptchaService } from './recaptcha.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private recaptchaService: RecaptchaService,
    private settingsService: SettingsService,
  ) {}

  async login(email: string, password: string, recaptchaToken?: string, fcmToken?: string) {
    const setting = await this.settingsService.get();

    // Recaptcha check — mirrors Laravel's conditional rule based on setting
    if (setting.recaptchaStatus === 'active') {
      if (!recaptchaToken) {
        throw new UnauthorizedException('Please complete the recaptcha to submit the form');
      }
      const isValid = await this.recaptchaService.verify(recaptchaToken);
      if (!isValid) {
        throw new UnauthorizedException('Recaptcha verification failed');
      }
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    // Check credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials please check your email and password');
    }

    // Check active status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Inactive account');
    }

    // Check banned
    if (user.isBanned) {
      throw new ForbiddenException('Your account has been banned');
    }

    // Check email verified
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email');
    }

    // Update FCM token if provided
    if (fcmToken) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { fcmToken },
      });
    }

    // Move guest/session cart to DB — equivalent of sessionCartToDatabase()
    // await this.cartService.mergeSessionCartToUser(user.id, sessionId);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      // Next.js frontend uses this to decide the redirect route
      redirectTo: user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard',
    };
  }

  async logout(userId: number) {
    // With JWT, "logout" is typically handled by the client discarding the token,
    // or by blacklisting the token/refresh-token server-side if you need forced invalidation.
    return { message: 'Logged out successfully.' };
  }
}