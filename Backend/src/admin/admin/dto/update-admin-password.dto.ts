import {
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdminPasswordDto {
  @IsString()
  current_password: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  password_confirmation: string;
}