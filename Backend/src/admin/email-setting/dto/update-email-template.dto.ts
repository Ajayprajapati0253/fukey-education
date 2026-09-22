import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}