
import {
    IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

const MATERIAL_TYPES = [
  'notes',
  'video',
  'practice_questions',
  'formula_sheet',
  'mcq',
  'important_questions',
  'sample_paper',
  'test_series',
  'question_bank',
];

export class CreateStudyMaterialDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  class_category_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_category_id: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsIn(MATERIAL_TYPES)
  type: string;

  @IsIn(['en', 'hi'])
  language: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((o) => o.type !== 'video')
  @IsOptional()
  @IsString()
  pdf_path?: string;

  @ValidateIf((o) => o.type === 'video')
  @IsUrl({ require_protocol: true })
  @MaxLength(255)
  video_url?: string;

  @Type(() => Boolean)
  @IsBoolean()
  is_paid: boolean;

  @ValidateIf((o) => o.is_paid === true)
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
@IsInt({ each: true })
@Type(() => Number)
online_test_question_ids?: number[];

}
