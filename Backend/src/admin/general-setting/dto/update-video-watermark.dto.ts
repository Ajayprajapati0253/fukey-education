import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateVideoWatermarkDto {
  @IsString()
  @IsNotEmpty()
  opacity: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  max_width: string;

  @IsOptional()
  @IsString()
  watermark_status?: string;
}