import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCustomerBioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  designation: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bio: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  short_bio: string;
}