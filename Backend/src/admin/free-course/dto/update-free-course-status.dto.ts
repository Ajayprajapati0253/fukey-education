import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFreeCourseStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}