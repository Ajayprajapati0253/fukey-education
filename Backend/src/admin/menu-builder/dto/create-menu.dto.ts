import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  menuname: string;

  // Example: { en: 'Main Menu', hi: 'मुख्य मेनू' }
  translations?: Record<string, string>;
}