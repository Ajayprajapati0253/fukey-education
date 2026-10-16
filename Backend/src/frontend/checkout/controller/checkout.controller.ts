import {
  Controller,
  Get,
  Req,
  BadRequestException,
} from '@nestjs/common';

import { Request } from 'express';
import { UseGuards } from '@nestjs/common';

import { CheckoutService } from '../services/checkout.service';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id?: string | number | bigint;
    sub?: string | number;
  };
}

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) {}

  @Get()
  async index(@Req() req: AuthenticatedRequest) {
    const rawUserId = req.user?.id ?? req.user?.sub;

    if (rawUserId === undefined || rawUserId === null) {
      throw new BadRequestException(
        'Authenticated user ID is missing',
      );
    }

    let userId: bigint;

    try {
      userId = BigInt(rawUserId);
    } catch {
      throw new BadRequestException(
        'Invalid authenticated user ID',
      );
    }

    if (userId <= 0n) {
      throw new BadRequestException(
        'Invalid authenticated user ID',
      );
    }

    return this.checkoutService.getCheckout(userId);
  }
}