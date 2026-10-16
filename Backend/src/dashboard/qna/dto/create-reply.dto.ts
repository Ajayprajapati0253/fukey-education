import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty({ message: 'Replay is required' })
  reply: string;
}