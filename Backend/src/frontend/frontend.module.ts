
import { Module } from '@nestjs/common';
import { FrontendController } from './frontend/controller/frontend.controller';
import { FrontendService } from './frontend/services/frontend.service';
import { BlogsController } from './blogs/controller/blogs.controller';
import { AboutController } from './about/controller/about.controller';
import { AboutService } from './about/services/about.service';
import { BlogsService } from './blogs/services/blogs.service';
import { CareerController } from './career/controller/career.controller';
import { CareerService } from './career/services/career.service';
import { CartController } from './cart/controller/cart.controller';
import { CouponService } from './cart/services/coupon.service';
import { CartService } from './cart/services/cart.service';
import { CheckoutController } from './checkout/controller/checkout.controller';
import { CheckoutService } from './checkout/services/checkout.service';



@Module({
  controllers: [FrontendController,BlogsController,AboutController,CareerController,CartController,CheckoutController],
  providers: [FrontendService,BlogsService,AboutService,CareerService,CartService,CouponService,CheckoutService],
})
export class FrontendModule {}
