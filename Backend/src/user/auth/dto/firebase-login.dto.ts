import {
  IsOptional,
  IsString,
} from 'class-validator';

export class FirebaseLoginDto {
  @IsOptional()
  @IsString()
  fcmToken?: string;
}