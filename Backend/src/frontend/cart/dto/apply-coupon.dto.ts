import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  coupon_code: string;
}