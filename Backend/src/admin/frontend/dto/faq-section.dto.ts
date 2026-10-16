import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FaqSectionDto {
  @IsString()
  @IsDefined()
  @MaxLength(255)
  short_title: string;

  @IsString()
  @IsDefined()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsDefined()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  total_languages?: string;
}