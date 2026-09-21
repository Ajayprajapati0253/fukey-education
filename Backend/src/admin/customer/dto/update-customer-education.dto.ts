import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCustomerEducationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organization: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  degree: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsBoolean()
  current: boolean;
}