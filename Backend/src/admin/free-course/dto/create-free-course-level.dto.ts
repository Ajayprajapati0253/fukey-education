import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFreeCourseLevelDto {
  @IsString()
  @IsNotEmpty({
    message: 'The name field is required',
  })
  @MaxLength(255, {
    message: 'The name field must not be greater than 255 characters',
  })
  name: string;

  @IsString()
  @IsNotEmpty({
    message: 'The slug field is required',
  })
  @MaxLength(255, {
    message: 'The slug field must not be greater than 255 characters',
  })
  slug: string;

  @IsBoolean({
    message: 'The status field must be a boolean',
  })
  status: boolean;
}