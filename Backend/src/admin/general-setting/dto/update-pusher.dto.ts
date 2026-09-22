import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdatePusherDto {
  @IsString()
  @IsNotEmpty()
  pusher_status: string;

  @IsString()
  @IsNotEmpty()
  pusher_app_id: string;

  @IsString()
  @IsNotEmpty()
  pusher_app_key: string;

  @IsString()
  @IsNotEmpty()
  pusher_app_secret: string;

  @IsString()
  @IsNotEmpty()
  pusher_app_cluster: string;
}