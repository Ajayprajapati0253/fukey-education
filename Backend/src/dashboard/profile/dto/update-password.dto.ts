
import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MaxLength(255)
  current_password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsString()
  @MaxLength(255)
  password_confirmation: string;
}
