import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCourseLevelDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}