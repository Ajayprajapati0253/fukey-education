import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SliderSectionDto {
  @IsString()
  @IsDefined()
  code: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  short_title_one: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title_one: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  sub_title_one: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  short_title_two: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title_two: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  sub_title_two: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  short_title_three: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title_three: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  sub_title_three: string;
}