import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateGoogleAnalyticDto {
  @IsString()
  @IsNotEmpty()
  google_analytic_status: string;

  @IsString()
  @IsNotEmpty()
  google_analytic_id: string;
}