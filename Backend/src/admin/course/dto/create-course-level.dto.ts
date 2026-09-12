import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCourseLevelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsBoolean()
  status: boolean;
}