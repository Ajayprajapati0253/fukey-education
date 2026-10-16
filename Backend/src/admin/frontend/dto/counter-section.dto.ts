import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CounterSectionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  total_student_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  total_instructor_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  total_courses_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  total_awards_count?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  section_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  button_text?: string;

  @IsOptional()
  @MaxLength(255)
  button_url?: string;
}