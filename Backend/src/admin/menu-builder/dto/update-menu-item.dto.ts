import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  idmenu?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  clases?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  role_id?: number;

  @IsOptional()
  arraydata?: Array<{
    id: number;
    label: string;
    link: string;
    code: string;
    role_id?: number;
  }>;

  translations?: Record<string, string>;
}