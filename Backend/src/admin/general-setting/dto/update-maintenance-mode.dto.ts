import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateMaintenanceModeDto {
  @IsString()
  @IsNotEmpty()
  maintenance_title: string;

  @IsString()
  @IsNotEmpty()
  maintenance_description: string;
}