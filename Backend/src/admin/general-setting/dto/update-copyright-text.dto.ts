import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateCopyrightTextDto {
  @IsString()
  @IsNotEmpty()
  copyright_text: string;
}