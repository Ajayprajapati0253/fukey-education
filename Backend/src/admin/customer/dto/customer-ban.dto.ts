import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CustomerBanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}