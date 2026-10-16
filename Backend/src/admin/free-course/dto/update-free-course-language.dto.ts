import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFreeCourseLanguageDto {
  @IsString({ message: 'Course language name must be a string' })
  @IsNotEmpty({ message: 'Course language name is required' })
  @MaxLength(255, {
    message: 'Course language name may not be greater than 255 characters',
  })
  name: string;

  @IsBoolean({
    message: 'Course language status must be a boolean',
  })
  status: boolean;
}