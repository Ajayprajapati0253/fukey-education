import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { Match } from '../../common/decorators/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email' })
  @MaxLength(255)
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(4, { message: 'Password must be 4 characters' })
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  passwordConfirmation: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'g-recaptcha-response' })
  gRecaptchaResponse?: string;
}