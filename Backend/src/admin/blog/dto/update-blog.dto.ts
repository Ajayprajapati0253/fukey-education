import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBlogDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  blog_category_id?: number;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  show_homepage?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_popular?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean;

  /*
   * Translation
   */
  @IsOptional()
  @IsString()
  lang_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;
}