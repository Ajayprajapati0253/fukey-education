import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Add course to cart
   *
   * Laravel equivalent:
   * add_to_cart()
   */
  async addToCart(
    userId: string,
    slug: string,
  ) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.prisma.courses.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        instructor_id: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Not Found!');
    }

    /**
     * User cannot add his own course
     */
    if (course.instructor_id === user.id) {
      throw new BadRequestException(
        'You can not add to cart your own course!',
      );
    }

    /**
     * Already purchased
     */
    const enrollment =
      await this.prisma.enrollments.findUnique({
        where: {
          user_id_course_id: {
            user_id: user.id,
            course_id: course.id,
          },
        },
      });

    if (enrollment) {
      throw new BadRequestException(
        'Already purchased',
      );
    }

    /**
     * Already in cart
     */
    const existingCart =
      await this.prisma.carts.findFirst({
        where: {
          user_id: user.id,
          course_id: course.id,
        },
      });

    if (existingCart) {
      throw new BadRequestException(
        'Already added to cart!',
      );
    }

    /**
     * Add course to cart
     */
    await this.prisma.carts.create({
      data: {
        user_id: user.id,
        course_id: course.id,
        type: 'course',
        qty: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    /**
     * Laravel:
     * cache()->forget("mobile_coupon_{$user->id}");
     *
     * Coupon cache will be handled when we implement
     * the coupon/cart GET logic.
     */

    const cartCount =
      await this.prisma.carts.count({
        where: {
          user_id: user.id,
        },
      });

    return {
      status: 'success',
      message: 'Added to cart successfully!',
      cart_count: cartCount,
    };
  }

  async addNoteToCart(
  userId: string,
  noteId: string,
) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const note = await this.prisma.notes.findUnique({
    where: {
      id: BigInt(noteId),
    },
  });

  if (!note) {
    throw new NotFoundException('Note not found!');
  }

  const existingCart =
    await this.prisma.carts.findFirst({
      where: {
        user_id: user.id,
        note_id: note.id,
      },
    });

  if (existingCart) {
    throw new BadRequestException(
      'Already added to cart!',
    );
  }

  await this.prisma.carts.create({
    data: {
      user_id: user.id,
      note_id: note.id,
      type: 'note',
      qty: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const cartCount =
    await this.prisma.carts.count({
      where: {
        user_id: user.id,
      },
    });

  return {
    status: 'success',
    message: 'Note added to cart successfully!',
    cart_count: cartCount,
  };
}

  async removeFromCart(
  userId: string,
  slug: string,
) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const course = await this.prisma.courses.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new NotFoundException('Not Found!');
  }

  const cartItem =
    await this.prisma.carts.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
      },
    });

  if (!cartItem) {
    throw new NotFoundException('Not Found!');
  }

  await this.prisma.carts.delete({
    where: {
      id: cartItem.id,
    },
  });

  const cartCount =
    await this.prisma.carts.count({
      where: {
        user_id: user.id,
      },
    });

  return {
    status: 'success',
    message: 'Item removed from cart!',
    cart_count: cartCount,
  };
}

async getCart(userId: string) {
  const user = await this.prisma.users.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const cartItems = await this.prisma.carts.findMany({
    where: {
      user_id: user.id,
      type: 'course',
      course_id: {
        not: null,
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  const courseIds = cartItems
    .map((item) => item.course_id)
    .filter((id): id is bigint => id !== null);

  if (courseIds.length === 0) {
    return {
      status: 'success',
      data: {
        total_qty: 0,
        sub_total: 0,
        coupon_discount: 0,
        payable_amount: 0,
        coupon_code: null,
        cart_courses: [],
      },
    };
  }

  const courses = await this.prisma.courses.findMany({
    where: {
      id: {
        in: courseIds,
      },
      status: 'active',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      instructor_id: true,
      thumbnail: true,
      price: true,
      discount: true,
    },
  });

  /*
   * Fetch instructors
   */
  const instructorIds = [
    ...new Set(
      courses.map((course) =>
        course.instructor_id.toString(),
      ),
    ),
  ].map((id) => BigInt(id));

  const instructors =
    instructorIds.length > 0
      ? await this.prisma.users.findMany({
          where: {
            id: {
              in: instructorIds,
            },
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
      : [];

  /*
   * Fetch reviews
   */
  const reviews =
    await this.prisma.course_reviews.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
        status: true,
      },
      select: {
        course_id: true,
        rating: true,
      },
    });

  /*
   * Fetch enrollment count
   */
  const enrollments =
    await this.prisma.enrollments.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
      },
      select: {
        course_id: true,
      },
    });

  /*
   * Build course response
   */
  const cartCourses = courses.map((course) => {
    const instructor = instructors.find(
      (item) =>
        item.id === course.instructor_id,
    );

    const courseReviews = reviews.filter(
      (review) =>
        review.course_id === course.id,
    );

    const rating =
      courseReviews.length > 0
        ? courseReviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0,
          ) / courseReviews.length
        : 0;

    const enrollmentCount =
      enrollments.filter(
        (enrollment) =>
          enrollment.course_id === course.id,
      ).length;

    const price = Number(course.price ?? 0);
    const discount = Number(course.discount ?? 0);

    const finalPrice =
      discount > 0 ? discount : price;

    const cartItem = cartItems.find(
      (item) =>
        item.course_id === course.id,
    );

    return {
      id: course.id.toString(),
      slug: course.slug,
      title: course.title,
      instructor: instructor
        ? {
            id: instructor.id.toString(),
            name: instructor.name,
            image: instructor.image,
          }
        : null,
      thumbnail: course.thumbnail,
      price,
      discount,
      final_price: finalPrice,
      quantity: cartItem?.qty ?? 1,
      average_rating: Number(
        rating.toFixed(1),
      ),
      enrollments: enrollmentCount,
    };
  });

  /*
   * Subtotal
   */
  const subTotal = cartCourses.reduce(
    (sum, course) =>
      sum +
      course.final_price * course.quantity,
    0,
  );

  const totalQty = cartCourses.reduce(
    (sum, course) =>
      sum + course.quantity,
    0,
  );

  return {
    status: 'success',
    data: {
      total_qty: totalQty,
      sub_total: Number(
        subTotal.toFixed(2),
      ),
      coupon_discount: 0,
      payable_amount: Number(
        subTotal.toFixed(2),
      ),
      coupon_code: null,
      cart_courses: cartCourses,
    },
  };
}
}