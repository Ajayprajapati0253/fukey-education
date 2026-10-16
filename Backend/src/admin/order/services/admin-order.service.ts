
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderQueryDto } from '../dto/order-query.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class AdminOrderService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<T>(data: T): T {
    return JSON.parse(
      JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  private parseId(id: string): bigint {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('Invalid order ID.');
    }

    return BigInt(id);
  }

  private async getOrderOrFail(
    tx: Prisma.TransactionClient,
    id: bigint,
  ) {
    const order = await tx.orders.findUnique({
      where: { id },
      include: {
        order_items: true,
        enrollments: true,
      },
    });

    if (!order) {
      throw new NotFoundException({
        success: false,
        message: 'Order not found.',
      });
    }

    return order;
  }

  private async adjustInstructorWallet(
    tx: Prisma.TransactionClient,
    courseId: bigint,
    amount: number,
    operation: 'increment' | 'decrement',
  ) {
    const course = await tx.courses.findUnique({
      where: { id: courseId },
      select: { instructor_id: true },
    });

    if (!course?.instructor_id) {
      return;
    }

    const commission = new Prisma.Decimal(amount.toFixed(2));

    await tx.users.update({
      where: { id: course.instructor_id },
      data: {
        wallet_balance:
          operation === 'increment'
            ? { increment: commission }
            : { decrement: commission },
      },
    });
  }

  private async changeOrderAccess(
    tx: Prisma.TransactionClient,
    order: Awaited<ReturnType<AdminOrderService['getOrderOrFail']>>,
    enable: boolean,
  ) {
    if (!order.buyer_id) {
      throw new BadRequestException(
        'Order has no buyer assigned.',
      );
    }

    for (const item of order.order_items) {
      if (item.item_type !== 'course' || !item.course_id) {
        continue;
      }

      if (enable) {
        await tx.enrollments.upsert({
          where: {
            user_id_course_id: {
              user_id: order.buyer_id,
              course_id: item.course_id,
            },
          },
          create: {
            order_id: order.id,
            user_id: order.buyer_id,
            course_id: item.course_id,
            has_access: true,
          },
          update: {
            order_id: order.id,
            has_access: true,
          },
        });
      } else {
        await tx.enrollments.deleteMany({
          where: {
            order_id: order.id,
            user_id: order.buyer_id,
            course_id: item.course_id,
          },
        });
      }
    }
  }

  private async changeCommissions(
    tx: Prisma.TransactionClient,
    order: Awaited<ReturnType<AdminOrderService['getOrderOrFail']>>,
    operation: 'increment' | 'decrement',
  ) {
    for (const item of order.order_items) {
      if (item.item_type !== 'course' || !item.course_id) {
        continue;
      }

      const course = await tx.courses.findUnique({
        where: { id: item.course_id },
        select: { instructor_id: true },
      });

      if (!course?.instructor_id) {
        continue;
      }

      const rate = item.commission_rate ?? order.commission_rate ?? 0;
      const commissionAmount = item.price * (rate / 100);
      const amountAfterCommission = item.price - commissionAmount;

      await this.adjustInstructorWallet(
        tx,
        item.course_id,
        amountAfterCommission,
        operation,
      );
    }
  }

  async findAll(query: OrderQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const all = (query as any)['par-page'] === 'all';
    const requestedLimit = Number((query as any)['par-page']);
    const limit = all
      ? undefined
      : Math.min(
          100,
          Math.max(1, requestedLimit || 20),
        );

    const where: Prisma.ordersWhereInput = {};

    if (query.keyword?.trim()) {
      where.invoice_id = {
        contains: query.keyword.trim(),
      };
    }

    if (query.order_status) {
      where.status = query.order_status as any;
    }

    if (query.payment_status) {
      where.payment_status = query.payment_status;
    }

    const orderBy = query.order_by === '1' ? 'asc' : 'desc';

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        where,
        include: {
          order_items: true,
          enrollments: true,
        },
        orderBy: { id: orderBy },
        ...(limit ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
      this.prisma.orders.count({ where }),
    ]);

    return {
      success: true,
      message: 'Orders fetched successfully.',
      data: this.serialize(orders),
      pagination: {
        total,
        page: all ? 1 : page,
        limit: limit ?? total,
        last_page: limit ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findPending() {
    const orders = await this.prisma.orders.findMany({
      where: { payment_status: 'pending' },
      include: {
        order_items: true,
        enrollments: true,
      },
      orderBy: { id: 'desc' },
    });

    return {
      success: true,
      message: 'Pending orders fetched successfully.',
      data: this.serialize(orders),
    };
  }

  async findOne(id: string) {
    const orderId = this.parseId(id);

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: true,
        enrollments: true,
      },
    });

    if (!order) {
      throw new NotFoundException({
        success: false,
        message: 'Order not found.',
      });
    }

    return {
      success: true,
      data: this.serialize(order),
    };
  }

  async updateStatus(id: string, dto: UpdateOrderDto) {
    const orderId = this.parseId(id);

    if (
      dto.order_status === undefined &&
      dto.payment_status === undefined
    ) {
      throw new BadRequestException(
        'Provide order_status or payment_status.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await this.getOrderOrFail(tx, orderId);

      const wasPaid = order.payment_status === 'paid';
      const requestedPaymentStatus = dto.payment_status;
      const willBePaid =
        requestedPaymentStatus === undefined
          ? wasPaid
          : wasPaid || requestedPaymentStatus === 'paid';

      const updateData: Prisma.ordersUpdateInput = {};

      if (dto.order_status !== undefined) {
        updateData.status = dto.order_status as any;
      }

      // Preserve Laravel's rule: an already-paid order's
      // payment status cannot be changed by this endpoint.
      if (!wasPaid && requestedPaymentStatus !== undefined) {
        updateData.payment_status = requestedPaymentStatus;
      }

      if (!wasPaid && willBePaid) {
        await this.changeOrderAccess(tx, order, true);
        await this.changeCommissions(tx, order, 'increment');
      } else if (
        !wasPaid &&
        requestedPaymentStatus !== undefined &&
        requestedPaymentStatus !== 'paid'
      ) {
        await this.changeOrderAccess(tx, order, false);
        await this.changeCommissions(tx, order, 'decrement');
      }

      const updated = await tx.orders.update({
        where: { id: orderId },
        data: updateData,
        include: {
          order_items: true,
          enrollments: true,
        },
      });

      return updated;
    });

    return {
      success: true,
      message: 'Order status updated successfully.',
      data: this.serialize(result),
    };
  }

  async remove(id: string) {
    const orderId = this.parseId(id);

    await this.prisma.$transaction(async (tx) => {
      const order = await this.getOrderOrFail(tx, orderId);

      if (order.payment_status === 'paid') {
        await this.changeOrderAccess(tx, order, false);
        await this.changeCommissions(tx, order, 'decrement');
      }

      // Offline receipt file deletion is intentionally kept outside
      // this service until its storage path and file handling are wired.
      // order_items and enrollments have database cascade on order_id.
      await tx.orders.delete({
        where: { id: orderId },
      });
    });

    return {
      success: true,
      message: 'Order deleted successfully.',
    };
  }

  
}
