
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TestimonialTranslationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lang_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  designation: string;

  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class CreateTestimonialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rating?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialTranslationDto)
  translations: TestimonialTranslationDto[];
}
