import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  currency_name: string;

  @IsString()
  @IsNotEmpty()
  country_code: string;

  @IsString()
  @IsNotEmpty()
  currency_code: string;

  @IsString()
  @IsNotEmpty()
  currency_icon: string;

  @IsNumber()
  @IsNotEmpty()
  currency_rate: number;

  @IsOptional()
  @IsString()
  is_default?: string;

  @IsOptional()
  @IsString()
  currency_position?: string;

  @IsOptional()
  @IsString()
  status?: string;
}