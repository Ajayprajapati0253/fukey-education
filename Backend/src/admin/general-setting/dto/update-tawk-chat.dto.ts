import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateTawkChatDto {
  @IsString()
  @IsNotEmpty()
  tawk_status: string;

  @IsString()
  @IsNotEmpty()
  tawk_chat_link: string;
}