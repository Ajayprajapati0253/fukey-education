import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateFacebookPixelDto {
  @IsString()
  @IsNotEmpty()
  pixel_status: string;

  @IsString()
  @IsNotEmpty()
  pixel_app_id: string;
}