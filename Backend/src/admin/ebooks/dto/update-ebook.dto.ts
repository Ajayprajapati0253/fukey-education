import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateEbookDto {
  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsOptional()
  @IsString()
  course_id?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsIn(['en', 'hi'])
  language: string;

  @IsNotEmpty()
  @IsUrl()
  pdf_url: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['Chemistry', 'Physics', 'Biology'])
  sub_subject?: string;
}