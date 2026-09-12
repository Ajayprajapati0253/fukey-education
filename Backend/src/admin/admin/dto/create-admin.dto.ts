import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  status: string;

  @IsOptional()
  role?: string[];
}