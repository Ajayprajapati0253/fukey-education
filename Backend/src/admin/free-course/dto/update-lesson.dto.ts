import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  MaxLength,
} from 'class-validator';

export class UpdateLessonDto {
  @IsNotEmpty()
  @IsString()
  chapter_item_id: string;

  @IsNotEmpty()
  @IsString()
  chapter: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  free_course_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsNotEmpty()
  @IsString()
  file_type: string;

  @IsOptional()
  @IsString()
  upload_path?: string;

  @IsOptional()
  @IsString()
  link_path?: string;

  @IsOptional()
  @IsNumberString()
  duration?: string;

  @IsOptional()
  @IsString()
  volume?: string;
}