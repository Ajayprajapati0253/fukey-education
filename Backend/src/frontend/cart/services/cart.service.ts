import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /cart
   * Fetch the authenticated student's cart.
   */
  async findAll(userId: bigint) {
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
      orderBy: {
        id: 'desc',
      },
    });

    const items = cartItems.map((item) => {
      const course = item.courses;

      const price =
        course?.discount && course.discount > 0
          ? course.discount
          : course?.price ?? 0;

      return {
        id: item.id.toString(),
        course_id: item.course_id?.toString() ?? null,
        qty: item.qty,
        course: course
          ? {
              ...course,
              id: course.id.toString(),
              price: course.price,
              discount: course.discount,
            }
          : null,
        final_price: price,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.final_price) * item.qty,
      0,
    );

    return {
      status: true,
      message: 'Cart fetched successfully.',
      data: {
        items,
        cart_count: items.reduce(
          (sum, item) => sum + item.qty,
          0,
        ),
        cart_total: Number(total.toFixed(2)),
      },
    };
  }

  /**
   * POST /cart/:courseId
   * Add an active course to the authenticated student's cart.
   */
  async addToCart(userId: bigint, courseId: bigint) {
    const course = await this.prisma.courses.findFirst({
      where: {
        id: courseId,
        status: 'active',
      },
      include: {
        carts: {
          where: {
            user_id: userId,
            type: 'course',
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.instructor_id === userId) {
      throw new BadRequestException(
        'You cannot add your own course to the cart.',
      );
    }

const enrollment = await this.prisma.enrollments.findFirst({
  where: {
    user_id: userId,
    course_id: courseId,
    has_access: true,
  },
  select: {
    id: true,
  },
});

if (enrollment) {
  throw new BadRequestException(
    'You have already purchased this course.',
  );
}

    if (course.carts.length > 0) {
      throw new BadRequestException(
        'Course is already in your cart.',
      );
    }

    await this.prisma.carts.create({
      data: {
        user_id: userId,
        course_id: courseId,
        qty: 1,
        type: 'course',
      },
    });

    const cartCount = await this.prisma.carts.count({
      where: {
        user_id: userId,
        type: 'course',
      },
    });

    return {
      status: true,
      message: 'Added to cart successfully.',
      cart_count: cartCount,
    };
  }

  /**
   * DELETE /cart/:courseId
   * Remove a course from the authenticated student's cart.
   */
  async removeCartItem(userId: bigint, courseId: bigint) {
    const cartItem = await this.prisma.carts.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        type: 'course',
      },
    });

    if (!cartItem) {
      throw new NotFoundException(
        'Course was not found in your cart.',
      );
    }

    await this.prisma.carts.delete({
      where: {
        id: cartItem.id,
      },
    });

    const cartCount = await this.prisma.carts.count({
      where: {
        user_id: userId,
        type: 'course',
      },
    });

    return {
      status: true,
      message: 'Item removed from cart.',
      cart_count: cartCount,
    };
  }
}