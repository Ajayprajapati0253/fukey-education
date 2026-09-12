import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCareerDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsIn(['Full Time', 'Part Time', 'Internship', 'Contract'])
  employment_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  vacancies?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsIn(['draft', 'published', 'closed'])
  status: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_urgent?: boolean;

  @IsOptional()
  @IsBoolean()
  is_remote?: boolean;

  @IsOptional()
  @IsDateString()
  published_at?: string;
}