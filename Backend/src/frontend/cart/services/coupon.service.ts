import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CouponService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async applyCoupon(
    userId: bigint,
    couponCode: string,
  ) {
    const coupon = await this.prisma.coupons.findFirst({
      where: {
        coupon_code: couponCode,
        status: 'active',
      },
    });

    if (!coupon) {
      throw new ForbiddenException('Invalid coupon.');
    }

    // expired_date schema mein String hai.
    // Laravel ki date comparison ke equivalent YYYY-MM-DD compare karein.
    const today = new Date().toISOString().slice(0, 10);

    if (coupon.expired_date.slice(0, 10) < today) {
      throw new ForbiddenException('Coupon already expired.');
    }

    const cartItems = await this.prisma.carts.findMany({
      where: {
        user_id: userId,
        type: 'course',
      },
      include: {
        courses: {
          select: {
            price: true,
            discount: true,
          },
        },
      },
    });

    const cartTotal = cartItems.reduce((total, item) => {
      const course = item.courses;

      if (!course) {
        return total;
      }

      const price =
        course.discount !== null && course.discount > 0
          ? course.discount
          : course.price ?? 0;

      return total + Number(price) * item.qty;
    }, 0);

    if (cartTotal <= 0) {
      throw new ForbiddenException(
        'Cart amount should be greater than 0.',
      );
    }

    if (cartTotal < Number(coupon.min_price)) {
      throw new ForbiddenException(
        `Minimum order amount should be ${Number(coupon.min_price)}.`,
      );
    }

    const discountAmount =
      (cartTotal * Number(coupon.offer_percentage)) / 100;

    const total = cartTotal - discountAmount;

    return {
      status: true,
      message: 'Coupon applied successfully.',
      data: {
        coupon_code: coupon.coupon_code,
        offer_percentage: Number(coupon.offer_percentage),
        discount_amount: Number(discountAmount.toFixed(2)),
        cart_total: Number(cartTotal.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }
}