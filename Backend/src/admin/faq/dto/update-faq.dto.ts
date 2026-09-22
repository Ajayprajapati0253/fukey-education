import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFaqDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  question: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  answer: string;
}