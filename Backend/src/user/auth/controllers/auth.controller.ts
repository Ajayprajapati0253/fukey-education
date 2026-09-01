  import {
    Body,
    Controller,
    Post,
    Put,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
    Delete,
    UnauthorizedException,
  } from '@nestjs/common';
  import { AuthService } from '../services/auth.service';
  import { LoginDto } from '../dto/login.dto';
  import { ConfirmPasswordDto } from '../dto/confirm-password.dto';
  import { RecaptchaGuard } from '../guards/recaptcha.guard';
  import { JwtAuthGuard } from '../guards/jwt-auth.guard';
  import { RegisterDto } from '../dto/register.dto';
  import { Param, Get } from '@nestjs/common';
  import { ForgotPasswordDto } from '../dto/forgot-password.dto';
  import { ResetPasswordDto } from '../dto/reset-password.dto';
  import { UpdatePasswordDto } from '../dto/update-password.dto';
  import { GoogleAuthGuard } from '../guards/google-auth.guard';
  import { FacebookAuthGuard } from '../guards/facebook-auth.guard';
  import { Res } from '@nestjs/common';
import { FirebaseLoginDto } from '../dto/firebase-login.dto';

  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @UseGuards(RecaptchaGuard)
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
      console.log("loginEmail: ",loginDto);
      return this.authService.login(loginDto);
    }

    @Post('firebase-login')
@HttpCode(HttpStatus.OK)
async firebaseLogin(
  @Req() req,
  @Body() dto: FirebaseLoginDto,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new UnauthorizedException({
      status: 'error',
      message: 'Firebase token missing',
    });
  }

  const firebaseToken = authorization.replace(
    /^Bearer\s+/i,
    '',
  );

  return this.authService.firebaseLogin(
    firebaseToken,
    dto.fcmToken,
  );
}

    @Post('confirm-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async confirmPassword(@Req() req, @Body() dto: ConfirmPasswordDto) {
      const { sub, email, role } = req.user;
      return this.authService.confirmPassword(sub, email, role, dto.password);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RecaptchaGuard)
    async register(@Body() dto: RegisterDto) {
      return this.authService.register(dto);
    }

    @Get('verify-email/:token')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Param('token') token: string) {
      // console.log('token is: ',token);
      const verifyTokens = await this.authService.verifyEmailToken(token);
      return verifyTokens;
      
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RecaptchaGuard)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
      return this.authService.forgotPassword(dto);
    }

    @Post('reset-password-store/:token')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RecaptchaGuard)
    async resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
      return this.authService.resetPassword(token, dto);
    }

    @Put('password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
      const { sub } = req.user;
      return this.authService.updatePassword(sub, dto);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
      // Guard khud Google pe redirect kar dega, yahan kuch likhne ki zaroorat nahi
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(@Req() req, @Res() res) {
      const result = await this.authService.socialLogin(req.user, 'google');
      return res.redirect(`${process.env.FRONTEND_URL}/social-login-success?token=${result.access_token}`);
    }

    @Get('facebook')
    @UseGuards(FacebookAuthGuard)
    async facebookLogin() {
      // Guard khud Facebook pe redirect kar dega
    }

    @Get('facebook/callback')
    @UseGuards(FacebookAuthGuard)
    async facebookCallback(@Req() req, @Res() res) {
      const result = await this.authService.socialLogin(req.user, 'facebook');
      return res.redirect(`${process.env.FRONTEND_URL}/social-login-success?token=${result.access_token}`);
    }

    @Post('logout')
@UseGuards(JwtAuthGuard)
logout() {
  return { message: 'Logged out successfully' };
}

@Get('check-access-token')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard)
async checkAccessToken() {
  return {
    status: 'success',
  };
}

@Delete('account-delete')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard)
async deleteAccount(@Req() req) {
  const { sub } = req.user;

  return this.authService.deleteAccount(BigInt(sub));
}
  }