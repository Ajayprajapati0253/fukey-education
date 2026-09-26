import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  // Meta Title - OPTIONAL
  @IsOptional()
  @IsString()
  @MaxLength(255)
  meta_title?: string;

  // Meta Description - OPTIONAL
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seo_description?: string;

  // Thumbnail - OPTIONAL
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnail?: string;

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
  @IsNotEmpty()
  instructor: number;

  @IsInt()
  @IsNotEmpty()
  category: number;

  // Publication Status
@IsOptional()
@IsString()
status?: string;

// Approval Status
@IsOptional()
@IsString()
approval_status?: string;
}