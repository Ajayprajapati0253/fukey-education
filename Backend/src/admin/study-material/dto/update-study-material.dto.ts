
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudyMaterialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  class_category_id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  subject_category_id?: string;

  @IsOptional()
  @IsIn([
    'notes',
    'video',
    'practice_questions',
    'formula_sheet',
    'mcq',
    'important_questions',
    'sample_paper',
    'test_series',
    'question_bank',
  ])
  type?: string;

  @IsOptional()
  @IsIn(['en', 'hi'])
  language?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  pdf_path?: string | null;

  @IsOptional()
  @IsString()
  video_url?: string | null;

  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  
  @IsOptional()
  @IsString()
  @MaxLength(255)
  online_test_title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(600)
  online_test_duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  online_test_questions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  online_test_marks?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  online_test_negative_marks?: number;

  @IsOptional()
  @IsIn(['manual', 'random'])
  online_test_question_mode?: 'manual' | 'random';

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  online_test_question_ids?: number[];

}
