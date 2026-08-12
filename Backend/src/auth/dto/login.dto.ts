import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'g-recaptcha-response' })
  gRecaptchaResponse?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;
}