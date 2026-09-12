import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCourseLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsBoolean()
  status: boolean;
}