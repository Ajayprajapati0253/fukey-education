
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';
import { MobileCouponService } from '../services/mobile-coupon.service';


interface AuthenticatedRequest extends Request {
  user: {
    id: string | number;
  };
}

@Controller('mobile-coupon')
@UseGuards(JwtAuthGuard)
export class MobileCouponController {
  constructor(
    private readonly mobileCouponService: MobileCouponService,
  ) {}

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  apply(
    @Req() req: AuthenticatedRequest,
    @Body() body: { coupon?: string },
  ) {
    return this.mobileCouponService.apply(
      req.user.id,
      body.coupon,
    );
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: AuthenticatedRequest) {
    return this.mobileCouponService.remove(req.user.id);
  }
}
