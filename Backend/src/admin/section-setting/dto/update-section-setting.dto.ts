
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSectionSettingDto {
  @IsOptional()
  @IsBoolean()
  hero_section?: boolean;

  @IsOptional()
  @IsBoolean()
  top_category_section?: boolean;

  @IsOptional()
  @IsBoolean()
  brands_section?: boolean;

  @IsOptional()
  @IsBoolean()
  about_section?: boolean;

  @IsOptional()
  @IsBoolean()
  gallery_section?: boolean;

  @IsOptional()
  @IsBoolean()
  featured_course_section?: boolean;

  @IsOptional()
  @IsBoolean()
  news_letter_section?: boolean;

  @IsOptional()
  @IsBoolean()
  featured_instructor_section?: boolean;

  @IsOptional()
  @IsBoolean()
  counter_section?: boolean;

  @IsOptional()
  @IsBoolean()
  faq_section?: boolean;

  @IsOptional()
  @IsBoolean()
  our_features_section?: boolean;

  @IsOptional()
  @IsBoolean()
  testimonial_section?: boolean;

  @IsOptional()
  @IsBoolean()
  banner_section?: boolean;

  @IsOptional()
  @IsBoolean()
  latest_blog_section?: boolean;

  @IsOptional()
  @IsBoolean()
  blog_page?: boolean;

  @IsOptional()
  @IsBoolean()
  about_page?: boolean;

  @IsOptional()
  @IsBoolean()
  contact_page?: boolean;
}
