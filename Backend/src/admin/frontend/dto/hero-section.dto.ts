import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class HeroSectionDto {

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  short_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  sub_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  action_button_text?: string;

  @IsOptional()
  @MaxLength(255)
  action_button_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  video_button_text?: string;

  @IsOptional()
  @MaxLength(255)
  video_button_url?: string;

  @IsOptional()
  @MaxLength(255)
  booking_number?: string;

  @IsOptional()
  @MaxLength(255)
  total_student?: string;

  @IsOptional()
  @MaxLength(255)
  total_instructor?: string;

  @IsOptional()
  @MaxLength(255)
  total_courses?: string;

  @IsOptional()
  @MaxLength(255)
  average_reviews?: string;
}