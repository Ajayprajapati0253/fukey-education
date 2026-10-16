
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAddressDto {
  @IsInt()
  @Min(1)
  country_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
