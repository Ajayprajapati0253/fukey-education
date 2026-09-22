import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UpdateFreeCourseMoreInfoDto {
  @IsInt()
  free_course_id: number;

  @IsOptional()
  @IsInt()
  course_duration?: number;

  @IsInt()
  category: number;

  @IsOptional()
  @IsBoolean()
  qna?: boolean;

  @IsOptional()
  @IsBoolean()
  partner_instructor?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  partner_instructors?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  levels?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  languages?: number[];
}