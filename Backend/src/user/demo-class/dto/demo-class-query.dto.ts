import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DemoClassQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  class_level: number;

  @IsIn(['english', 'hindi'])
  language: string;

  @IsOptional()
  @IsString()
  subject?: string;
}