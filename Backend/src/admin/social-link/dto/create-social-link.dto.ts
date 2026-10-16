
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  link: string;

  // Icon is received as a multipart file, not in the DTO.
}
