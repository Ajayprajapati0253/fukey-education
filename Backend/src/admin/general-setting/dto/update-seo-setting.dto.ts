import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateSeoSettingDto {
  @IsString()
  @IsNotEmpty()
  seo_title: string;

  @IsString()
  @IsNotEmpty()
  seo_description: string;
}