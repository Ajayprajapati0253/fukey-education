import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateFreeCourseDeleteRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['inactive', 'active'])
  action: 'inactive' | 'active';
}