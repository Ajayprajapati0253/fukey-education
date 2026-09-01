import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAdminProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  bio?: string;
}