import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private firebaseService: FirebaseService,

  ) {}

async login(dto: LoginDto) {
  const user = await this.prisma.users.findUnique({
    where: {
      email: dto.email,
    },
  });

  console.log('LOGIN DEBUG:', {
    email: dto.email,
    userFound: !!user,
    userId: user?.id,
    passwordHashExists: !!user?.password,
    passwordHashPrefix: user?.password?.substring(0, 7),
  });

  if (!user) {
    throw new UnauthorizedException({
      status: 'error',
      message:
        'Invalid credentials please check your email and password',
    });
  }

  // Laravel bcrypt ($2y$) → Node bcrypt ($2b$)
  const passwordHash = user.password.replace(/^\$2y\$/, '$2b$');

  console.log('HASH DEBUG:', {
    originalPrefix: user.password.substring(0, 7),
    convertedPrefix: passwordHash.substring(0, 7),
    hashLength: passwordHash.length,
  });

  const passwordMatch = await bcrypt.compare(
    dto.password,
    passwordHash,
  );

  console.log('PASSWORD MATCH:', passwordMatch);

  if (!passwordMatch) {
    throw new UnauthorizedException({
      status: 'error',
      message:
        'Invalid credentials please check your email and password',
    });
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ForbiddenException({
      status: 'error',
      message: 'Inactive account',
    });
  }

  if (user.is_banned === UserStatus.BANNED) {
    throw new ForbiddenException({
      status: 'error',
      message: 'Your account has been banned',
    });
  }

  if (!user.email_verified_at) {
    throw new ForbiddenException({
      status: 'error',
      message: 'Please verify your email',
    });
  }

  // FCM optional — same as Laravel
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

const payload = {
  sub: user.id.toString(),
  email: user.email,
  role: user.role,
};

const accessToken = this.jwtService.sign(payload);

  return {
    status: 'success',
    message: 'Logged in successfully.',
    accessToken,
      user_id: user.id.toString(),

  };
}

async firebaseLogin(
  firebaseToken: string,
  fcmToken?: string,
) {
  if (!firebaseToken) {
    throw new UnauthorizedException({
      status: 'error',
      message: 'Firebase token missing',
    });
  }

  try {
    // 1. Verify Firebase ID token
    const verifiedToken =
      await this.firebaseService.verifyIdToken(
        firebaseToken,
      );

    // Firebase UID
    const firebaseUid = verifiedToken.uid;

    // Phone number verified by Firebase
    const phone = verifiedToken.phone_number;

    if (!firebaseUid) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Invalid Firebase token',
      });
    }

    // 2. Find existing user
    let user = await this.prisma.users.findFirst({
      where: {
        firebase_uid: firebaseUid,
      },
    });

    let isNewUser = false;

    // 3. Create user if this is the first login
    if (!user) {
      isNewUser = true;

      const randomPassword =
        crypto.randomBytes(32).toString('hex');

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        10,
      );

user = await this.prisma.users.create({
  data: {
    firebase_uid: firebaseUid,
    name: '',
    role: 'student',
    phone: phone ?? null,
    status: UserStatus.ACTIVE,
    is_banned: UserStatus.UNBANNED,
    password: hashedPassword,
  },
});
    }

    // 4. Check account status
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({
        status: 'error',
        message: 'Inactive account',
      });
    }

    // 5. Check banned status
    if (user.is_banned === UserStatus.BANNED) {
      throw new ForbiddenException({
        status: 'error',
        message: 'Account banned',
      });
    }

    // 6. Save FCM token if provided
    if (fcmToken) {
      await this.prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          fcm_token: fcmToken,
        },
      });

      // Keep local object consistent
      user.fcm_token = fcmToken;
    }

    // 7. Generate Fukey JWT
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken =
      this.jwtService.sign(payload);

    // 8. Same basic response structure as Laravel
    return {
      status: 'success',
      accessToken,
      user_id: user.id.toString(),
      is_new_user: isNewUser,
    };
  } catch (error) {
    if (
      error instanceof UnauthorizedException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }

    console.error('FIREBASE LOGIN ERROR:', error);

    throw new UnauthorizedException({
      status: 'error',
      message: 'Invalid Firebase token',
    });
  }
}
  /**
   * ConfirmablePasswordController.store() ka JWT equivalent.
   * Laravel session me timestamp likhta hai; JWT stateless hai isliye
   * hum naya token issue karte hain jisme pwdConfirmedAt claim ho.
   */
async confirmPassword(
  userId: bigint,
  email: string,
  role: string,
  password: string,
) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found.');
  }

  // Laravel bcrypt ($2y$) -> Node bcrypt compatible format ($2b$)
  const passwordHash = user.password.replace(/^\$2y\$/, '$2b$');

  const isMatch = await bcrypt.compare(
    password,
    passwordHash,
  );

  if (!isMatch) {
    throw new BadRequestException({
      password: 'The password is incorrect.',
    });
  }

  const pwdConfirmedAt = Math.floor(Date.now() / 1000);

  const payload = {
    sub: user.id.toString(),
    email,
    role,
    pwdConfirmedAt,
  };

  const accessToken = this.jwtService.sign(payload);

  return {
    accessToken,
    message: 'Password confirmed successfully',
  };
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

  async deleteAccount(userId: bigint) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundException({
      status: 'error',
      message: 'User not found.',
    });
  }

  await this.prisma.users.delete({
    where: {
      id: userId,
    },
  });

  return {
    status: 'success',
    message: 'Account deleted successfully.',
  };
}
}