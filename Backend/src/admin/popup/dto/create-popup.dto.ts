
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePopupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Image upload controller ke multipart/form-data se hoga.

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
