
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateSocialLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  link?: string;
}
