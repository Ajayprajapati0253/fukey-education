import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateGoogleCaptchaDto {
  @IsString()
  @IsNotEmpty()
  recaptcha_site_key: string;

  @IsString()
  @IsNotEmpty()
  recaptcha_secret_key: string;

  @IsString()
  @IsNotEmpty()
  recaptcha_status: string;
}