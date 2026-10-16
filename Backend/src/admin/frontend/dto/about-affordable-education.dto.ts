import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class AboutAffordableEducationDto {
  @IsString()
  code: string;

  @ValidateIf((o) => o.code === 'en')
  @IsString()
  @MaxLength(255)
  short_title?: string;

  @ValidateIf((o) => o.code === 'en')
  @IsString()
  @MaxLength(255)
  title?: string;

  @ValidateIf((o) => o.code === 'en')
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