import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFreeCourseSubCategoryDto {
  @IsString()
  @IsNotEmpty({
    message: 'The name field is required',
  })
  @MaxLength(255, {
    message: 'The name may not be greater than 255 characters.',
  })
  name: string;

  @IsBoolean({
    message: 'The status must be a boolean',
  })
  status: boolean;

  @IsString({
    message: 'Language code must be a string',
  })
  @IsNotEmpty({
    message: 'Language code is required.',
  })
  code: string;
}