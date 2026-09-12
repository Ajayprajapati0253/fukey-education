import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCareerApplicationDto {
  @Type(() => Number)
  @IsInt()
  career_id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  current_company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  expected_salary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  cover_letter?: string;
}