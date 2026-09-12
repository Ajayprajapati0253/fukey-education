import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCourseDeleteRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['inactive', 'active'])
  action: string;
}