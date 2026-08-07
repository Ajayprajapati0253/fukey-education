import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPasswordDto {
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}