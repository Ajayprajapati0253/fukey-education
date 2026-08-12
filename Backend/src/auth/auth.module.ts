import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { RecaptchaService } from './services/recaptcha.service';
import { RecaptchaGuard } from './guards/recaptcha.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordConfirmedGuard } from './guards/password-confirmed.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './services/email.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RecaptchaService,
    RecaptchaGuard,
    EmailService,  
    JwtStrategy,
    JwtAuthGuard,
    PasswordConfirmedGuard,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}