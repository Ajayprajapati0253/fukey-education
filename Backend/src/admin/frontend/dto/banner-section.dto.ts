import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BannerSectionDto {
  @IsOptional()
  @MaxLength(255)
  video_url?: string;
}