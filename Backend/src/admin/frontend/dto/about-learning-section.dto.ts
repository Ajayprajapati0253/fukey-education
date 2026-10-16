import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class AboutLearningSectionDto {
  @IsString()
  @IsDefined()
  code: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  @MaxLength(255)
  short_title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  button_text?: string;

  @IsOptional()
  @MaxLength(255)
  button_url?: string;

  @IsOptional()
  @MaxLength(255)
  video_url?: string;
}