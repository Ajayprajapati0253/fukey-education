import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCustomCodeDto {
  @IsOptional()
  @IsString()
  css?: string;

  @IsOptional()
  @IsString()
  javascript?: string;

  @IsOptional()
  @IsString()
  header_javascript?: string;
}