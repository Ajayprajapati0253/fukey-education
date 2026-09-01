import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  password_confirmation: string;
}