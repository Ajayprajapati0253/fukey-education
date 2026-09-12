import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCourseChapterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsInt()
  course_id: number;
}