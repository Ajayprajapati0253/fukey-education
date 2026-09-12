import {
  IsArray,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}