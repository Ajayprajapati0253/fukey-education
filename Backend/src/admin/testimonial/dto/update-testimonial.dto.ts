
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestimonialTranslationDto } from './create-testimonial.dto';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rating?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialTranslationDto)
  translations?: TestimonialTranslationDto[];
}
