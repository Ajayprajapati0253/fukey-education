import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateLiveClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsInt()
  instructor: number;

  @ValidateIf((o) => o.platform !== 'youtube')
  @IsInt()
  @IsNotEmpty()
  course_id?: number;

  @ValidateIf((o) => o.platform === 'youtube')
  @IsInt()
  @IsNotEmpty()
  free_course_id?: number;

  @IsOptional()
  @IsIn(['jitsi', 'youtube'])
  platform?: 'jitsi' | 'youtube';

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((o) => !o.recurring_days)
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

  @IsInt()
  @Min(10)
  duration: number;

  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsString()
  youtube_video_id?: string;
}