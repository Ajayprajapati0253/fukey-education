import {
  IsDefined,
  IsString,
  MaxLength,
} from 'class-validator';

export class LanguageDto {
  @IsDefined()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsDefined()
  @IsString()
  @MaxLength(4)
  code: string;
}