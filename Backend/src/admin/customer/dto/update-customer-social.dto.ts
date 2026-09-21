import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCustomerSocialDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebook?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  github?: string;
}