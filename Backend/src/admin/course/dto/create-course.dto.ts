import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_price?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsInt()
  instructor: number;
}