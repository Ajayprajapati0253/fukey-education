import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateFooterSettingDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  footer_text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone_one?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone_two?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  get_in_touch_text?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  google_play_link?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  apple_store_link?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;
}