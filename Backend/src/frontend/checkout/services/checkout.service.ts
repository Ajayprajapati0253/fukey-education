import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getCheckout(userId: bigint) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const cartItems = await this.prisma.carts.findMany({
      where: {
        user_id: userId,
        type: 'course',
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            discount: true,
            thumbnail: true,
            status: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException(
        'Please add some courses in your cart.',
      );
    }

    let cartTotal = 0;

    const items = cartItems.map((item) => {
      const course = item.courses;

      if (!course || course.status !== 'active') {
        throw new BadRequestException(
          'A course in your cart is no longer available.',
        );
      }

      const price =
        course.discount != null && course.discount > 0
          ? course.discount
          : course.price ?? 0;

      const subtotal = price * item.qty;
      cartTotal += subtotal;

      return {
        cart_id: item.id.toString(),
        course_id: course.id.toString(),
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        price,
        quantity: item.qty,
        subtotal,
      };
    });

    // Coupon persistence and payment gateway integration
    // will be added in the next steps.

    return {
      message: 'Checkout details fetched successfully.',
      data: {
        cart_count: cartItems.reduce(
          (count, item) => count + item.qty,
          0,
        ),
        items,
        cart_total: Number(cartTotal.toFixed(2)),
        discount_percent: 0,
        discount_amount: 0,
        coupon: '',
        payable_amount: Number(cartTotal.toFixed(2)),
        currency: 'INR',
        payment_gateways: [],
      },
    };
  }
}