import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FinishFreeCourseDto {
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message_for_reviewer?: string;
}