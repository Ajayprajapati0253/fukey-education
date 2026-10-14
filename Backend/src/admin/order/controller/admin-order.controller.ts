
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { AdminOrderService } from '../services/admin-order.service';
import { OrderQueryDto } from '../dto/order-query.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

// Import your project's existing admin authentication/permission guards
// and apply them here if not already applied by a parent controller/module.

@Controller('admin/orders')
export class AdminOrderController {
  constructor(
    private readonly orderService: AdminOrderService,
  ) {}

  /**
   * GET /admin/orders
   * Supports keyword, order_status, payment_status,
   * par-page, page and order_by.
   */
  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.orderService.findAll(query);
  }

  /**
   * GET /admin/orders/pending
   */
  @Get('pending')
  findPending() {
    return this.orderService.findPending();
  }

  /**
   * GET /admin/orders/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  /**
   * PATCH /admin/orders/:id/status
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }

  /**
   * DELETE /admin/orders/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
