
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRefundDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  reasone: string;

  @IsNotEmpty()
  @IsString()
  account_information: string;
}
