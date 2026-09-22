import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateGeneralSettingDto {
  @IsString()
  @IsNotEmpty()
  app_name: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  is_queable: string;

  @IsOptional()
  @IsString()
  site_address?: string;

  @IsOptional()
  @IsString()
  site_email?: string;

  @IsOptional()
  @IsString()
  header_topbar_status?: string;

  @IsOptional()
  @IsString()
  header_social_status?: string;

  @IsOptional()
  @IsString()
  cursor_dot_status?: string;

  @IsOptional()
  @IsString()
  preloader_status?: string;

  @IsString()
  @IsNotEmpty()
  live_mail_send: string;
}