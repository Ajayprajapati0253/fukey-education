import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  question: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  answer: string;
}