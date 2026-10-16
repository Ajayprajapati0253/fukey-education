import { IsDefined, IsString } from 'class-validator';

export class NewsletterSectionDto {
  @IsDefined()
  @IsString()
  image: string;
}