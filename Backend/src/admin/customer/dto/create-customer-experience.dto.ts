import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsBoolean()
  current: boolean;
}