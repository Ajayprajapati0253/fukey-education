import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class OurFeaturesSectionDto {
  @IsString()
  @IsDefined()
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sec_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sec_description?: string;

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
  title_two: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  sub_title_two: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title_three: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  sub_title_three: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title_four?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sub_title_four?: string;

  @IsOptional()
  @IsString()
  button_url_one?: string;

  @IsOptional()
  @IsString()
  button_url_two?: string;

  @IsOptional()
  @IsString()
  button_url_three?: string;

  @IsOptional()
  @IsString()
  button_url_four?: string;
}