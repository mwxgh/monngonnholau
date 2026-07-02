import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { OrdersService } from './orders.service'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { CreateQuickOrderDto } from './dto/create-quick-order.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post('quick')
  createQuick(@Body() dto: CreateQuickOrderDto) {
    return this.ordersService.createQuickOrder(dto)
  }

  @Public()
  @Get(':id/payment-status')
  paymentStatus(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getQuickOrderPaymentStatus(id)
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin')
  findAllAdmin() {
    return this.ordersService.findAllAdmin()
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Patch('admin/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ) {
    return this.ordersService.updateOrderStatus(id, status)
  }

  @Public()
  @Post('payment/webhook')
  @HttpCode(200)
  paymentWebhook(@Body() body: Record<string, unknown>) {
    return this.ordersService.handlePaymentWebhook(body)
  }
}
