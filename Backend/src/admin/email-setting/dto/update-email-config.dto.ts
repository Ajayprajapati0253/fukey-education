import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateEmailConfigDto {
  @IsString()
  @IsNotEmpty()
  mail_sender_name: string;

  @IsEmail()
  @IsNotEmpty()
  mail_sender_email: string;

  @IsEmail()
  @IsNotEmpty()
  contact_message_receiver_mail: string;

  @IsString()
  @IsNotEmpty()
  mail_host: string;

  @IsString()
  @IsNotEmpty()
  mail_username: string;

  @IsString()
  @IsNotEmpty()
  mail_password: string;

  @IsString()
  @IsNotEmpty()
  mail_port: string;

  @IsString()
  @IsNotEmpty()
  mail_encryption: string;
}