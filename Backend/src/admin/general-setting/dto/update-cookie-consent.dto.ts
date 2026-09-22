import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateCookieConsentDto {
  @IsString()
  @IsNotEmpty()
  cookie_status: string;

  @IsString()
  @IsNotEmpty()
  border: string;

  @IsString()
  @IsNotEmpty()
  corners: string;

  @IsString()
  @IsNotEmpty()
  background_color: string;

  @IsString()
  @IsNotEmpty()
  text_color: string;

  @IsString()
  @IsNotEmpty()
  border_color: string;

  @IsString()
  @IsNotEmpty()
  btn_bg_color: string;

  @IsString()
  @IsNotEmpty()
  btn_text_color: string;

  @IsString()
  @IsNotEmpty()
  link_text: string;

  @IsString()
  @IsNotEmpty()
  btn_text: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}