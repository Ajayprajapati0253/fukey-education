import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class UpdateCustomPaginationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  quantities: number[];
}