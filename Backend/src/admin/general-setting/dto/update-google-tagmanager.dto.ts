import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateGoogleTagmanagerDto {
  @IsString()
  @IsNotEmpty()
  google_tagmanager_status: string;

  @IsString()
  @IsNotEmpty()
  google_tagmanager_id: string;
}