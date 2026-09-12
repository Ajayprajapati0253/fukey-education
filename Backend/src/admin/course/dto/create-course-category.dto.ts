import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourseCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsBoolean()
  status: boolean;

  @IsBoolean()
  show_at_trending: boolean;
}