import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateLiveClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsInt()
  instructor: number;

  @IsDateString()
  start_time: string;

  @IsInt()
  @Min(10)
  duration: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  status: boolean;
}