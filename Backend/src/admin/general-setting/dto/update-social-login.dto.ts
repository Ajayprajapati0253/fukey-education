import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSocialLoginDto {
  @IsString()
  @IsNotEmpty()
  google_login_status: string;

  @IsString()
  @IsNotEmpty()
  gmail_client_id: string;

  @IsString()
  @IsNotEmpty()
  gmail_secret_id: string;

  @IsOptional()
  @IsString()
  gmail_redirect_url?: string;
}