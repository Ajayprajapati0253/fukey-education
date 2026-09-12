import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  blog_category_id: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsBoolean()
  show_homepage?: boolean;

  @IsOptional()
  @IsBoolean()
  is_popular?: boolean;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  lang_code?: string;

  @IsOptional()
  @IsString()
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