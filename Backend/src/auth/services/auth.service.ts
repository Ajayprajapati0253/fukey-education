import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../enums/user-status.enum';

import { EmailService } from './email.service';
import { RegisterDto } from '../dto/register.dto';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';



@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    console.log("logindto:",dto.email);
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    // Laravel: !$user || !Hash::check(...)
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException({ email: 'Invalid credentials please check your email and password' });
    }

    // Laravel: status != ACTIVE  ← YE MISSING THA, ADD KIYA
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ email: 'Inactive account' });
    }

    // Laravel: is_banned == BANNED ('yes')
    if (user.is_banned === UserStatus.BANNED) {
      throw new ForbiddenException({ message: 'Your account has been banned', alertType: 'error' });
    }

    // Laravel: !email_verified_at  ← YE MISSING THA, ADD KIYA
    if (!user.email_verified_at) {
      throw new UnauthorizedException({ message: 'Please verify your email', alertType: 'error' });
    }

    // FCM token update — Laravel: if ($request->filled('fcm_token'))
    if (dto.fcmToken) {
      await this.prisma.users.update({
        where: { id: user.id },
        data: { fcm_token: dto.fcmToken },
      });
    }

    // TODO (Course/Order module migrate hone ke baad): Laravel ka sessionCartToDatabase()
    // yahan call hoga — JWT stateless hai isliye cart merge client se course-ids array
    // bhej kar karna padega (session cart nahi milega).

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

  /**
   * ConfirmablePasswordController.store() ka JWT equivalent.
   * Laravel session me timestamp likhta hai; JWT stateless hai isliye
   * hum naya token issue karte hain jisme pwdConfirmedAt claim ho.
   */
  async confirmPassword(userId: number, email: string, role: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Laravel: Auth::guard('web')->validate([...]) — sirf verify, dobara login nahi
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException({ password: 'The password is incorrect.' });
    }

    const pwdConfirmedAt = Math.floor(Date.now() / 1000);
    const payload = { sub: userId, email, role, pwdConfirmedAt };
    const accessToken = this.jwtService.sign(payload); // naya token — purane ki jagah client isko use karega

    return { accessToken, message: 'Password confirmed successfully' };
  }

  async register(dto: RegisterDto) {
    // Laravel: 'email' => 'unique:users,email'
    const existingEmail = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException({ email: 'Email already exist' });
    }

    // Laravel: 'phone' => 'unique:users,phone'
    const existingPhone = await this.prisma.users.findFirst({ where: { phone: dto.phone } });
    if (existingPhone) {
      throw new ConflictException({ phone: 'Phone number already exist' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(50).toString('hex').slice(0, 100); // Laravel: Str::random(100)

    const user = await this.prisma.users.create({
      data: {
        role: 'student',
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        status: UserStatus.ACTIVE,
        is_banned: UserStatus.UNBANNED,
        password: hashedPassword,
        verification_token: verificationToken,
      },
    });

    // Laravel: session()->put('registerUser', ...) — GTM/marketing tracking hai, auth se related nahi.
    // JWT stateless hai, isliye response me hi bhej dete hain — frontend khud GTM push karega agar zaroorat ho.

    await this.emailService.sendVerificationEmail({
      name: dto.name,
      email: dto.email,
      verificationToken,
    });

    return {
      message: 'A verification link has been sent to your mail, please verify and enjoy our service',
      trackingData: { name: dto.name, email: dto.email, phone: dto.phone }, // optional, GTM ke liye
    };
  }

  async verifyEmailToken(token: string) {
    // console.log("token: ", token );
    const user = await this.prisma.users.findFirst({ where: { verification_token: token } });

    if (!user) {
      throw new NotFoundException({ message: 'Invalid token' });
    }

    if (user.email_verified_at) {
      throw new ConflictException({ message: 'Email already verified' });
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { email_verified_at: new Date(), verification_token: null },
    });

    return { message: 'Verification successful please try to login now' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } });

    if (!user) {
      // Laravel: throw ValidationException::withMessages(['email' => 'Email does not exist'])
      throw new BadRequestException({ email: 'Email does not exist' });
    }

    const forgetPasswordToken = crypto.randomBytes(50).toString('hex').slice(0, 100); // Laravel: Str::random(100)

    await this.prisma.users.update({
      where: { id: user.id },
      data: { forget_password_token: forgetPasswordToken },
    });

    await this.emailService.sendForgotPasswordEmail({
      name: user.name,
      email: dto.email,
      forgetPasswordToken,
    });

    return { message: 'A password reset link has been sent to your mail' };
  }

  async resetPassword(token: string, dto: ResetPasswordDto) {
    // Laravel: User::where('forget_password_token', $token)->where('email', $request->email)->first()
    const user = await this.prisma.users.findFirst({
      where: { forget_password_token: token, email: dto.email },
    });

    if (!user) {
      // Laravel: redirect back with 'Invalid token, please try again'
      throw new BadRequestException({ message: 'Invalid token, please try again' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forget_password_token: null, // one-time use, same pattern as verification_token
      },
    });

    return { message: 'Password Reset successfully' };
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Laravel: 'current_password' => ['required', 'current_password']
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException({ current_password: 'The current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async socialLogin(callbackUser: { id: string; email: string; name: string; avatar?: string; token?: string; refreshToken?: string }, providerName: string) {
    if (!callbackUser?.email) {
      throw new BadRequestException('Email permission is required for social login.');
    }

    let user = await this.prisma.users.findUnique({ where: { email: callbackUser.email } });

    if (user) {
      // Existing user — check if this social provider is already linked
      const existingCredential = await this.prisma.socialite_credentials.findFirst({
        where: { user_id: user.id, provider_name: providerName, provider_id: callbackUser.id },
      });

      if (existingCredential) {
        // Same checks Laravel does before login
        if (user.status !== 'active') {
          throw new UnauthorizedException('Inactive account');
        }
        if (user.is_banned !== 'no') {
          throw new UnauthorizedException('Inactive account');
        }
        if (process.env.NODE_ENV === 'production' && !user.email_verified_at) {
          throw new UnauthorizedException('Please verify your email');
        }
        // All good — issue JWT (same as normal login)
        return this.issueTokenForUser(user);
      } else {
        // User exists by email but hasn't linked this provider yet — link it now
        await this.prisma.socialite_credentials.create({
          data: {
            user_id: user.id,
            provider_name: providerName,
            provider_id: callbackUser.id,
            access_token: callbackUser.token ?? null,
            refresh_token: callbackUser.refreshToken ?? null,
          },
        });
        return this.issueTokenForUser(user);
      }
    } else {
      // Brand new user — create account (mirrors NewUserCreateTrait)
      const randomPassword = crypto.randomBytes(8).toString('hex'); // random password, user won't use it directly
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.users.create({
        data: {
          name: callbackUser.name,
          email: callbackUser.email,
          status: 'active',
          is_banned: 'no',
          image: callbackUser.avatar ?? undefined,
          email_verified_at: new Date(),
          password: hashedPassword,
          verification_token: crypto.randomBytes(50).toString('hex'),
        },
      });

      await this.prisma.socialite_credentials.create({
        data: {
          user_id: user.id,
          provider_name: providerName,
          provider_id: callbackUser.id,
          access_token: callbackUser.token ?? null,
          refresh_token: callbackUser.refreshToken ?? null,
        },
      });

      // STUB — real email sending deferred to Phase 16 (matches EmailService pattern)
      console.log(`[STUB] Sending default password email to ${user.email}: ${randomPassword}`);

      return this.issueTokenForUser(user);
    }
  }

  private async issueTokenForUser(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload), user };
  }

}