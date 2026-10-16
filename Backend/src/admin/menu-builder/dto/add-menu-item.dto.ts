import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddMenuItemDto {
  @IsInt()
  idmenu: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  labelmenu: string;

  @IsString()
  @MaxLength(255)
  linkmenu: string;

  @IsOptional()
  @IsInt()
  rolemenu?: number;

  @IsOptional()
  translations?: Record<string, string>;
}