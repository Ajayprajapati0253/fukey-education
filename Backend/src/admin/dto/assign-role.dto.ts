import {
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class AssignRoleDto {
  @IsInt()
  @Min(1)
  user_id: number;

  @IsArray()
  @IsString({ each: true })
  role: string[];
}