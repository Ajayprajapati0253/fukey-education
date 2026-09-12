import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';


@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const coupons = await this.prisma.coupons.findMany({
      where: {
        author_id: 0,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      status: 'success',
      data: coupons.map((coupon) => ({
        ...coupon,
        id: coupon.id.toString(),
        offer_percentage: coupon.offer_percentage.toString(),
        min_price: coupon.min_price.toString(),
      })),
    };
  }

  async create(dto: CreateCouponDto) {
    // Laravel: unique:coupons
    const existingCoupon = await this.prisma.coupons.findFirst({
      where: {
        coupon_code: dto.coupon_code,
      },
    });

    if (existingCoupon) {
      throw new ConflictException('Coupon already exist');
    }

    const coupon = await this.prisma.coupons.create({
      data: {
        author_id: 0,
        coupon_code: dto.coupon_code,
        offer_percentage: dto.offer_percentage,
        min_price: dto.min_price,
        expired_date: dto.expired_date,
        status: (dto.status ?? 'active') as any,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Coupon created successfully',
      data: {
        ...coupon,
        id: coupon.id.toString(),
        offer_percentage: coupon.offer_percentage.toString(),
        min_price: coupon.min_price.toString(),
      },
    };
  }

  async update(id: string, dto: UpdateCouponDto) {
    const couponId = BigInt(id);

    const existingCoupon = await this.prisma.coupons.findUnique({
      where: {
        id: couponId,
      },
    });

    if (!existingCoupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Laravel:
    // unique:coupons,coupon_code,{id}
    if (dto.coupon_code) {
      const duplicateCoupon = await this.prisma.coupons.findFirst({
        where: {
          coupon_code: dto.coupon_code,
          NOT: {
            id: couponId,
          },
        },
      });

      if (duplicateCoupon) {
        throw new ConflictException('Coupon already exist');
      }
    }

    const updatedCoupon = await this.prisma.coupons.update({
      where: {
        id: couponId,
      },
      data: {
        ...(dto.coupon_code !== undefined && {
          coupon_code: dto.coupon_code,
        }),

        ...(dto.offer_percentage !== undefined && {
          offer_percentage: dto.offer_percentage,
        }),

        ...(dto.min_price !== undefined && {
          min_price: dto.min_price,
        }),

        ...(dto.expired_date !== undefined && {
          expired_date: dto.expired_date,
        }),

        ...(dto.status !== undefined && {
          status: dto.status as any,
        }),

        updated_at: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Coupon updated successfully',
      data: {
        ...updatedCoupon,
        id: updatedCoupon.id.toString(),
        offer_percentage: updatedCoupon.offer_percentage.toString(),
        min_price: updatedCoupon.min_price.toString(),
      },
    };
  }

  async remove(id: string) {
    const couponId = BigInt(id);

    const coupon = await this.prisma.coupons.findUnique({
      where: {
        id: couponId,
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.prisma.coupons.delete({
      where: {
        id: couponId,
      },
    });

    return {
      status: 'success',
      message: 'Coupon deleted successfully',
    };
  }
}