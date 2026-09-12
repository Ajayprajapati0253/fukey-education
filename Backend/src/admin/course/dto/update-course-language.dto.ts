import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCourseLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsBoolean()
  status: boolean;
}