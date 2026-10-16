import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { Request } from 'express';

import { CartService } from '../services/cart.service';
import { CouponService } from '../services/coupon.service';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';


interface AuthenticatedRequest extends Request {
  user: {
    id: string | number | bigint;
    sub?: string | number;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
  ) {}

  private getUserId(req: AuthenticatedRequest): bigint {
    const userId = req.user?.id ?? req.user?.sub;

    if (userId === undefined || userId === null) {
      throw new BadRequestException('Authenticated user ID is missing');
    }

    try {
      const parsedId = BigInt(userId);

      if (parsedId <= 0n) {
        throw new Error('Invalid ID');
      }

      return parsedId;
    } catch {
      throw new BadRequestException('Invalid authenticated user ID');
    }
  }

  /**
   * GET /cart
   * Fetch logged-in user's cart.
   */
  @Get()
  async getCart(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);

    return this.cartService.findAll(userId);
  }

  /**
   * POST /cart/add/:id
   * Add course to cart.
   */
  @Post('add/:id')
  async addToCart(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(req);

    if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
      throw new BadRequestException('Invalid course ID');
    }

    return this.cartService.addToCart(userId, BigInt(id));
  }

  /**
   * DELETE /cart/remove/:id
   * Remove course from cart.
   */
  @Delete('remove/:id')
  async removeCartItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(req);

    if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
      throw new BadRequestException('Invalid course ID');
    }

    return this.cartService.removeCartItem(userId, BigInt(id));
  }

  /**
   * POST /cart/apply-coupon
   * Validate coupon and calculate discount.
   */
  @Post('apply-coupon')
  async applyCoupon(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApplyCouponDto,
  ) {
    const userId = this.getUserId(req);

    return this.couponService.applyCoupon(
      userId,
      dto.coupon_code.trim(),
    );
  }
}