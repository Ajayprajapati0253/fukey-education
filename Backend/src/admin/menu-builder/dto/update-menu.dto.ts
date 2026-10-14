import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMenuDto {
  @IsInt()
  idmenu: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  menuname?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  arraydata?: Array<{
    id: number;
    parent: number;
    sort: number;
    depth: number;
    role_id?: number;
  }>;

  translations?: Record<string, string>;
}