
import {
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateBioDto {
  @IsString()
  @MaxLength(255)
  job_title: string;

  @IsString()
  @MaxLength(2000)
  bio: string;

  @IsString()
  @MaxLength(300)
  short_bio: string;
}
