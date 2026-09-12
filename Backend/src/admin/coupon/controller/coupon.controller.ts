import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { AdminAuthGuard } from 'src/admin-auth/guards/admin-auth.guard';

@Controller('admin/coupons')
@UseGuards(AdminAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponService.update(id.toString(), dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.remove(id.toString());
  }
}