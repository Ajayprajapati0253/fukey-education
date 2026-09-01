import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from '../services/cart.service';
import { JwtAuthGuard } from 'src/user/auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  /**
   * POST /cart/:slug
   */
  @Post(':slug')
  async addToCart(
    @Req() req: any,
    @Param('slug') slug: string,
  ) {
    return this.cartService.addToCart(
      req.user.sub,
      slug,
    );
  }

   @Get()
  async getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.sub);
  }


  @Post('note/:noteId')
async addNoteToCart(
  @Req() req: any,
  @Param('noteId') noteId: string,
) {
  return this.cartService.addNoteToCart(
    req.user.sub,
    noteId,
  );
}

  @Delete(':slug')
async removeFromCart(
  @Req() req: any,
  @Param('slug') slug: string,
) {
  return this.cartService.removeFromCart(
    req.user.sub,
    slug,
  );
}
}