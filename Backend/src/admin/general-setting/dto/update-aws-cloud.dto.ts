import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateAwsCloudDto {
  @IsString()
  @IsNotEmpty()
  aws_access_id: string;

  @IsString()
  @IsNotEmpty()
  aws_secret_key: string;

  @IsString()
  @IsNotEmpty()
  aws_bucket: string;

  @IsString()
  @IsNotEmpty()
  aws_region: string;

  @IsString()
  @IsNotEmpty()
  aws_status: string;
}