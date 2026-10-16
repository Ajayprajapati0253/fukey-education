
import { IsHexColor, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSiteColorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  primary_color!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  secondary_color!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  common_color_one!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  common_color_two!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  common_color_three!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  common_color_four!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsHexColor()
  common_color_five!: string;
}
