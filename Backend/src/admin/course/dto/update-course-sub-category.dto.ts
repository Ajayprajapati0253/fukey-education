import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCourseSubCategoryDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}