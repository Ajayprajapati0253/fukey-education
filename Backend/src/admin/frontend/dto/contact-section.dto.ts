import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ContactSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone_one?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone_two?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email_one?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email_two?: string;

  @IsOptional()
  @IsString()
  map?: string;
}