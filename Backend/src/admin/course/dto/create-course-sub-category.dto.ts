import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCourseSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsBoolean()
  status: boolean;
}