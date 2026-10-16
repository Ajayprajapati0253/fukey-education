
import {
  Controller,
  Get,
  Query,
  Param,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import { OrdersService } from '../services/orders.service';
import { JwtAuthGuard } from '../../../user/auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  getOrders(
    @Req() req: Request & { user: { sub: string } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.getOrders(req.user.sub, page, limit);
  }

  @Get('orders/:invoice_id')
  getOrderDetails(
    @Req() req: Request & { user: { sub: string } },
    @Param('invoice_id') invoiceId: string,
  ) {
    return this.ordersService.getOrderDetails(req.user.sub, invoiceId);
  }

  @Get('orders/:invoice_id/invoice')
async downloadInvoice(
  @Req() req: Request & { user: { sub: string } },
  @Param('invoice_id') invoiceId: string,
  @Res() res: Response,
) {
  const pdf = await this.ordersService.downloadInvoice(
    req.user.sub,
    invoiceId,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
    'Content-Length': pdf.length,
  });

  return res.end(pdf);
}
}
