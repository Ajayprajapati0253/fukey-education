import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitBlogCommentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  blog_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;
}