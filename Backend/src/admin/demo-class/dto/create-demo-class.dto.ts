import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDemoClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  course_category_id: string;

  @IsIn(['english', 'hindi'])
  language: string;

  @IsUrl()
  @IsNotEmpty()
  video_url: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration?: number;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  is_active: boolean;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}