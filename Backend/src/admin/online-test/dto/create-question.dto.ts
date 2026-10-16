import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionOptionDto {
  @IsString()
  option_key: string;

  @IsString()
  option_text: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}

export class CreateQuestionDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  class_id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  subject_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  chapter_id?: number;

  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  question_type?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  marks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  negative_marks?: number;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];
}