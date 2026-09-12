import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsString()
  status: string;

  @IsOptional()
  role?: string[];
}