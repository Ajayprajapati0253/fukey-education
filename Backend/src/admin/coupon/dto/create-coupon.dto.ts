import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  coupon_code: string;

  @IsNumber()
  offer_percentage: number;

  @IsNumber()
  min_price: number;

  @IsString()
  @IsNotEmpty()
  expired_date: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}