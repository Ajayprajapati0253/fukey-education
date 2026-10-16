import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionBankDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  class_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_id: number;

  @IsOptional()
  @IsString()
  search?: string;
}