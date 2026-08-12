import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' }) // Laravel: Password::defaults() plain default
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  passwordConfirmation: string;
}