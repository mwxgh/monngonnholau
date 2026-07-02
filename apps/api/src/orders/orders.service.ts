import { createHmac } from 'crypto'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PayOS } from '@payos/node'
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { CreateQuickOrderDto } from './dto/create-quick-order.dto'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly payos: PayOS | null = null
  private readonly checksumKey: string | null = null
  private readonly clientUrl: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService
  ) {
    const clientId = this.config.get<string>('PAYOS_CLIENT_ID')
    const apiKey = this.config.get<string>('PAYOS_API_KEY')
    const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY')

    if (clientId && apiKey && checksumKey) {
      this.payos = new PayOS({ clientId, apiKey, checksumKey })
      this.checksumKey = checksumKey
    }

    this.clientUrl = this.config.get('CLIENT_URL', 'http://localhost:3000')
  }

  private verifyWebhookSignature(
    data: Record<string, unknown>,
    signature: string
  ): boolean {
    if (!this.checksumKey) return false
    const sorted = Object.keys(data)
      .sort()
      .map((k) => `${k}=${String(data[k])}`)
      .join('&')
    const expected = createHmac('sha256', this.checksumKey)
      .update(sorted)
      .digest('hex')
    return expected === signature
  }

  async createQuickOrder(dto: CreateQuickOrderDto) {
    const skus = dto.items.map((i) => i.sku)
    const variants = await this.prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      include: { inventory: true, product: { select: { name: true } } }
    })

    if (variants.length !== skus.length) {
      throw new BadRequestException('Một số sản phẩm không tồn tại')
    }

    for (const item of dto.items) {
      const v = variants.find((v) => v.sku === item.sku)!
      const qty = v.inventory?.quantity ?? 0
      if (qty < item.qty) {
        throw new BadRequestException(
          `Sản phẩm "${v.product.name} — ${v.name}" không đủ số lượng trong kho`
        )
      }
    }

    let subtotal = 0
    const orderItems = dto.items.map((item) => {
      const v = variants.find((v) => v.sku === item.sku)!
      const price = Number(v.price)
      const total = price * item.qty
      subtotal += total
      return {
        variantId: v.id,
        name: `${v.product.name} — ${v.name}`,
        sku: v.sku,
        price: v.price,
        quantity: item.qty,
        total
      }
    })

    const shippingSetting = await this.prisma.setting.findUnique({
      where: { key: 'shipping_fee' }
    })
    const shippingFee = shippingSetting ? Number(shippingSetting.value) : 30000
    const total = subtotal + shippingFee
    const parts = [dto.street, dto.ward, dto.district, dto.province].filter(
      Boolean
    )
    const detail = parts.join(', ')

    const isV1 = !!dto.district
    const address = await this.prisma.address.create({
      data: {
        fullName: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        street: dto.street,
        detail,
        ...(isV1
          ? {
              oldProvince: dto.province,
              oldDistrict: dto.district,
              oldWard: dto.ward
            }
          : { province: dto.province, ward: dto.ward })
      }
    })

    const isCod = dto.paymentMethod === PaymentMethod.COD
    const order = await this.prisma.order.create({
      data: {
        addressId: address.id,
        note: dto.note ?? null,
        status: isCod ? OrderStatus.PROCESSING : OrderStatus.PENDING_PAYMENT,
        paymentMethod: isCod ? PaymentMethod.COD : PaymentMethod.ONLINE,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        items: { create: orderItems }
      }
    })

    // Confirmation email (fire-and-forget)
    if (dto.email) {
      this.mail
        .sendOrderCreated({
          to: dto.email,
          customerName: dto.name,
          orderId: order.id,
          items: orderItems.map((i) => ({
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            price: Number(i.price)
          })),
          subtotal,
          shippingFee,
          total,
          address: detail
        })
        .catch(() => {})
    }

    // Create PayOS payment link
    if (!this.payos || dto.paymentMethod === PaymentMethod.COD) {
      return { orderId: order.id, total }
    }

    try {
      const orderCode = Date.now()
      const desc = `DH#${order.id} MNNL`.slice(0, 25)

      const paymentLink = await this.payos.paymentRequests.create({
        orderCode,
        amount: total,
        description: desc,
        items: orderItems.map((i) => ({
          name: i.name.slice(0, 50),
          quantity: i.quantity,
          price: Number(i.price)
        })),
        buyerName: dto.name,
        buyerPhone: dto.phone,
        buyerEmail: dto.email,
        returnUrl: `${this.clientUrl}/?order=${order.id}&paid=1`,
        cancelUrl: `${this.clientUrl}/?order=${order.id}&paid=0`
      })

      const payment = await this.prisma.payment.create({
        data: {
          amount: total,
          orderCode: BigInt(orderCode),
          description: desc,
          checkoutUrl: paymentLink.checkoutUrl,
          qrCode: paymentLink.qrCode,
          status: PaymentStatus.PENDING,
          expiredAt: new Date(Date.now() + 15 * 60 * 1000)
        }
      })

      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id }
      })

      return {
        orderId: order.id,
        total,
        qrCode: paymentLink.qrCode,
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode
      }
    } catch (err) {
      this.logger.error(`PayOS failed: ${(err as Error).message}`)
      return { orderId: order.id, total }
    }
  }

  async getQuickOrderPaymentStatus(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        payment: { select: { id: true, status: true, orderCode: true } }
      }
    })
    if (!order) throw new BadRequestException('Đơn hàng không tồn tại')

    const payment = order.payment

    // Already paid or no PayOS payment — return DB state directly
    if (!payment || payment.status === PaymentStatus.PAID || !this.payos) {
      return {
        orderStatus: order.status,
        paymentStatus: payment?.status ?? null
      }
    }

    // Actively check with PayOS
    try {
      const info = await this.payos.paymentRequests.get(
        Number(payment.orderCode)
      )
      if (info?.status === 'PAID') {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.PAID, paidAt: new Date() }
          }),
          this.prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.PAID }
          })
        ])
        return {
          orderStatus: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID
        }
      }
    } catch (err) {
      this.logger.warn(`PayOS status check failed: ${(err as Error).message}`)
    }

    return { orderStatus: order.status, paymentStatus: payment.status }
  }

  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        address: { select: { fullName: true, phone: true } },
        items: {
          select: { name: true, quantity: true },
          orderBy: { id: 'asc' }
        },
        payment: { select: { status: true } }
      }
    })

    return orders.map((o) => ({
      id: o.id,
      customerName: o.address.fullName,
      phone: o.address.phone,
      items: o.items.map((i) => `${i.name} ×${i.quantity}`),
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.payment?.status ?? null,
      createdAt: o.createdAt
    }))
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      select: { id: true, status: true }
    })
  }

  async handlePaymentWebhook(body: Record<string, unknown>) {
    if (!this.checksumKey) return { success: true }

    const { signature, data } = body as {
      signature?: string
      data?: Record<string, unknown>
    }
    if (!signature || !data)
      return { success: false, message: 'Invalid payload' }

    if (!this.verifyWebhookSignature(data, signature)) {
      this.logger.warn('Webhook signature invalid')
      return { success: false, message: 'Invalid signature' }
    }

    // Only process successful payments
    if (data['code'] !== '00' && body['code'] !== '00') return { success: true }

    const orderCode = BigInt(data['orderCode'] as number)
    const payment = await this.prisma.payment.findUnique({
      where: { orderCode },
      include: { order: { select: { id: true } } }
    })

    if (!payment) {
      this.logger.warn(`Webhook: payment not found for orderCode ${orderCode}`)
      return { success: true }
    }

    // Already processed
    if (payment.status === PaymentStatus.PAID) return { success: true }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          gatewayData: body as Prisma.InputJsonValue
        }
      }),
      ...(payment.order
        ? [
            this.prisma.order.update({
              where: { id: payment.order.id },
              data: { status: OrderStatus.PAID }
            })
          ]
        : [])
    ])

    this.logger.log(
      `Payment confirmed: orderCode=${orderCode}, orderId=${payment.order?.id}`
    )
    return { success: true }
  }
}
