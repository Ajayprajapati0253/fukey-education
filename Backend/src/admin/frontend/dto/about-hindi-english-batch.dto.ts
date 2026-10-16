import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class AboutHindiEnglishBatchDto {
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
  @MaxLength(255)
  title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsDefined()
  @IsString()
  @MaxLength(5000)
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