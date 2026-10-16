import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  order_status?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'failed', 'cancelled', 'refunded'])
  payment_status?: string;
}