import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  free_course_id: string;

  @IsNotEmpty()
  @IsString()
  chapter_id: string;

  @IsNotEmpty()
  @IsString()
  type: string;

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

  @IsNotEmpty()
  @IsNumberString()
  duration: string;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsBoolean()
  is_free?: boolean;
}