
import {
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class MobileCouponService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private async getCartTotal(userId: bigint): Promise<number> {
    const cartItems = await this.prisma.carts.findMany({
      where: { user_id: userId },
      include: {
        courses: {
          select: {
            price: true,
          },
        },
      },
    });

    return cartItems.reduce((total, item) => {
      const price = Number(item.courses?.price ?? 0);
      return total + price * item.qty;
    }, 0);
  }

  async apply(userIdValue: string | number, couponValue?: string) {
    const userId = BigInt(userIdValue);
    const couponCode = couponValue?.trim();

    if (!couponCode) {
      throw new BadRequestException({
        status: 'error',
        message: { coupon: ['Coupon is required'] },
      });
    }

    const coupon = await this.prisma.coupons.findFirst({
      where: {
        coupon_code: couponCode,
        status: 'active',
      },
    });

    if (!coupon) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid coupon',
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (coupon.expired_date < today) {
      throw new BadRequestException({
        status: 'error',
        message: 'Coupon already expired',
      });
    }

    const cartTotal = await this.getCartTotal(userId);
    const minimumPrice = Number(coupon.min_price);

    if (cartTotal <= 0 || cartTotal < minimumPrice) {
      throw new BadRequestException({
        status: 'error',
        message: `Minimum order amount should be ${minimumPrice}`,
      });
    }

    const discountAmount = Number(
      (
        (cartTotal * Number(coupon.offer_percentage)) /
        100
      ).toFixed(2),
    );

    await this.cache.set(
      `mobile_coupon_${userId.toString()}`,
      {
        coupon_code: coupon.coupon_code,
        discount_amount: discountAmount,
      },
      30 * 60 * 1000,
    );

    return {
      status: 'success',
      message: 'Coupon applied successfully',
    };
  }

  async remove(userIdValue: string | number) {
    const userId = BigInt(userIdValue);

    await this.cache.del(`mobile_coupon_${userId.toString()}`);

    return {
      status: 'success',
      message: 'Coupon removed',
    };
  }
}
