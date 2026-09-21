import { IsInt, IsNotEmpty } from 'class-validator';

export class EnrollStudentDto {
  @IsInt()
  @IsNotEmpty()
  course_id: number;
}