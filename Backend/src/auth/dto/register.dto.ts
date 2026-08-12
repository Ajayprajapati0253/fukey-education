import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { Match } from '../../common/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email' })
  @MaxLength(255)
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Length(10, 15, { message: 'Phone number must be valid' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(4, { message: 'You have to provide minimum 4 character password' })
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