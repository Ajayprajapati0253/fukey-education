import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class FeaturedCourseSectionDto {
  @IsOptional()
  @IsInt()
  all_category?: number;

  @IsOptional()
  @IsString()
  all_category_ids?: string;

  @IsOptional()
  @IsBoolean()
  all_category_status?: boolean;

  @IsOptional()
  @IsInt()
  category_one?: number;

  @IsOptional()
  @IsString()
  category_one_ids?: string;

  @IsOptional()
  @IsBoolean()
  category_one_status?: boolean;

  @IsOptional()
  @IsInt()
  category_two?: number;

  @IsOptional()
  @IsString()
  category_two_ids?: string;

  @IsOptional()
  @IsBoolean()
  category_two_status?: boolean;

  @IsOptional()
  @IsInt()
  category_three?: number;

  @IsOptional()
  @IsString()
  category_three_ids?: string;

  @IsOptional()
  @IsBoolean()
  category_three_status?: boolean;

  @IsOptional()
  @IsInt()
  category_four?: number;

  @IsOptional()
  @IsString()
  category_four_ids?: string;

  @IsOptional()
  @IsBoolean()
  category_four_status?: boolean;

  @IsOptional()
  @IsInt()
  category_five?: number;

  @IsOptional()
  @IsString()
  category_five_ids?: string;

  @IsOptional()
  @IsBoolean()
  category_five_status?: boolean;
}