import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendBulkCustomerMailDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}