import { IsEnum } from 'class-validator';
import { career_applications_status } from '@prisma/client';

export class UpdateCareerApplicationStatusDto {
  @IsEnum(career_applications_status)
  status: career_applications_status;
}