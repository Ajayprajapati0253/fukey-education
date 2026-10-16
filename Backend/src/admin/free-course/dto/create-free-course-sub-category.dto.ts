import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFreeCourseSubCategoryDto {
  @IsString()
  @IsNotEmpty({
    message: 'The name field is required',
  })
  @MaxLength(255, {
    message: 'The name may not be greater than 255 characters.',
  })
  name: string;

  @IsString()
  @IsNotEmpty({
    message: 'The slug field is required',
  })
  @MaxLength(255, {
    message: 'The slug field may not be greater than 255 characters.',
  })
  slug: string;

  @IsBoolean({
    message: 'The status must be a boolean',
  })
  status: boolean;
}