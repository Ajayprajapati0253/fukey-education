import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class OurPurposeDto {
  @IsString()
  @IsDefined()
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  short_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  button_text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  button_url?: string;
}