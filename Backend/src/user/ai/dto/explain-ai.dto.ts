import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ExplainAiDto {
  @IsString()
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsInt()
  thread_id?: number;
}