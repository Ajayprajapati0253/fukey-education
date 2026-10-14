
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PageTranslationDto {
  @IsString()
  @IsNotEmpty()
  lang_code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageTranslationDto)
  translations: PageTranslationDto[];
}
