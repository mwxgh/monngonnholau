import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { OrdersService } from './orders.service'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateQuickOrderDto } from './dto/create-quick-order.dto'

interface AuthUser {
  id: number
}

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

  // ── Self routes ──────────────────────────────────────────────

  @Get('me')
  findAllForUser(@CurrentUser() user: AuthUser) {
    return this.ordersService.findAllForUser(user.id)
  }

  @Get('me/:id')
  findOneForUser(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.ordersService.findOneForUser(user.id, id)
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin')
  findAllAdmin() {
    return this.ordersService.findAllAdmin()
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/export')
  async exportOrders(@Query('status') status?: string) {
    const buffer = await this.ordersService.exportOrdersExcel(status)
    return new StreamableFile(new Uint8Array(buffer), {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="don-hang-${Date.now()}.xlsx"`
    })
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneAdmin(id)
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
