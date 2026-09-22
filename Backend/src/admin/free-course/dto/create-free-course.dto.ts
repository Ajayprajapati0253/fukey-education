import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFreeCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seo_description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  thumbnail: string;

  @IsOptional()
  @IsString()
  demo_video_source?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsInt()
  instructor: number;

  @IsOptional()
  @IsString()
  demo_video_storage?: string;

  @IsOptional()
  @IsBoolean()
  edit_mode?: boolean;

  @IsOptional()
  @IsInt()
  id?: number;
}