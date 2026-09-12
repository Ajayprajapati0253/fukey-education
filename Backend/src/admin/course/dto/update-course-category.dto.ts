import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCourseCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  code: string;
}