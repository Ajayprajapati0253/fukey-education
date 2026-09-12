import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCourseChapterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}