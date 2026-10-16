import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class AboutSectionDto {
  @IsString()
  @IsDefined()
  code: string;

  // =========================
  // TRANSLATED CONTENT
  // =========================

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  @MaxLength(255)
  short_title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  button_text?: string;

  // =========================
  // GLOBAL CONTENT
  // =========================

  @IsOptional()
  @MaxLength(255)
  button_url?: string;

  @IsOptional()
  @MaxLength(255)
  video_url?: string;

  @IsOptional()
  year_experience?: string;

  @IsOptional()
  @MaxLength(255)
  course_success?: string;

  @IsOptional()
  @MaxLength(255)
  phone_number?: string;
}