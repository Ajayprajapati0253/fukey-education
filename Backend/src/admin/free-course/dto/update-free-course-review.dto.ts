import { IsNotEmpty } from 'class-validator';

export class UpdateFreeCourseReviewDto {
  @IsNotEmpty({
    message: 'Status is required',
  })
  status: boolean;
}