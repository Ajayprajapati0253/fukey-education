import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInstructorLiveClassDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  course_id?: string;

  @IsOptional()
  @IsString()
  free_course_id?: string;

  @IsInt()
  @Min(10)
  duration: number;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsArray()
  recurring_days?: string[];

  @IsOptional()
  @IsString()
  recurring_time?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  youtube_video_id?: string;
}