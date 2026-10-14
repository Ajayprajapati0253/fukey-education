import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Question is required' })
  @MaxLength(255, {
    message: 'Question may not be greater than 255 characters',
  })
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}