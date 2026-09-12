import { IsBoolean } from 'class-validator';

export class UpdateCourseReviewDto {
  @IsBoolean()
  status: boolean;
}