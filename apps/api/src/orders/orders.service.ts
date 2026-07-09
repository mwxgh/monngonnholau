import { createHmac } from 'crypto'
import { join } from 'path'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PayOS } from '@payos/node'
import ExcelJS from 'exceljs'
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { CreateQuickOrderDto } from './dto/create-quick-order.dto'

/**
 * Arranges `qty` boxes of the same size (l x w x h) into an nx x ny x nz
 * grid that's as close to a cube as possible, instead of stacking them in
 * a single line. E.g. 4 boxes of 10x10x10 -> nx=2, ny=2, nz=1 -> 20x20x10
 * (not 40x10x10).
 */
function packDimensions(
  length: number,
  width: number,
  height: number,
  qty: number
) {
  if (qty <= 1) return { length, width, height }
  const nx = Math.ceil(Math.cbrt(qty))
  const ny = Math.ceil(Math.sqrt(qty / nx))
  const nz = Math.ceil(qty / (nx * ny))
  return { length: length * nx, width: width * ny, height: height * nz }
}

// The 63 provinces spelled exactly as SPX's address directory expects
// (State_list sheet in the bulk order import template)
const SPX_PROVINCES = [
  'AN GIANG',
  'BÀ RỊA - VŨNG TÀU',
  'BẮC GIANG',
  'BẮC KẠN',
  'BẠC LIÊU',
  'BẮC NINH',
  'BẾN TRE',
  'BÌNH ĐỊNH',
  'BÌNH DƯƠNG',
  'BÌNH PHƯỚC',
  'BÌNH THUẬN',
  'CÀ MAU',
  'CẦN THƠ',
  'CAO BẰNG',
  'ĐÀ NẴNG',
  'ĐẮK LẮK',
  'ĐẮK NÔNG',
  'ĐIỆN BIÊN',
  'ĐỒNG NAI',
  'ĐỒNG THÁP',
  'GIA LAI',
  'HÀ GIANG',
  'HÀ NAM',
  'HÀ NỘI',
  'HÀ TĨNH',
  'HẢI DƯƠNG',
  'HẢI PHÒNG',
  'HẬU GIANG',
  'HÒA BÌNH',
  'HƯNG YÊN',
  'KHÁNH HÒA',
  'KIÊN GIANG',
  'KON TUM',
  'LAI CHÂU',
  'LÂM ĐỒNG',
  'LẠNG SƠN',
  'LÀO CAI',
  'LONG AN',
  'NAM ĐỊNH',
  'NGHỆ AN',
  'NINH BÌNH',
  'NINH THUẬN',
  'PHÚ THỌ',
  'PHÚ YÊN',
  'QUẢNG BÌNH',
  'QUẢNG NAM',
  'QUẢNG NGÃI',
  'QUẢNG NINH',
  'QUẢNG TRỊ',
  'SÓC TRĂNG',
  'SƠN LA',
  'TÂY NINH',
  'THÁI BÌNH',
  'THÁI NGUYÊN',
  'THANH HÓA',
  'THỪA THIÊN HUẾ',
  'TIỀN GIANG',
  'TP. HỒ CHÍ MINH',
  'TRÀ VINH',
  'TUYÊN QUANG',
  'VĨNH LONG',
  'VĨNH PHÚC',
  'YÊN BÁI'
]

/**
 * Normalizes a province name to the exact spelling SPX expects (uppercase,
 * strip the "Tỉnh"/"Thành phố"/"TP." prefix — except "TP. Hồ Chí Minh",
 * which keeps its "TP." prefix).
 * "Thành phố Hà Nội" -> "HÀ NỘI", "Tp Hồ Chí Minh" -> "TP. HỒ CHÍ MINH"
 */
function normalizeProvince(name: string): string {
  const stripped = name
    .replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '')
    .trim()
    .toUpperCase()
  const match = SPX_PROVINCES.find(
    (p) => p.replace(/^TP\.\s*/, '') === stripped
  )
  return match ?? stripped
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly payos: PayOS | null = null
  private readonly checksumKey: string | null = null
  private readonly clientUrl: string
  private readonly orderTemplatePath = join(
    __dirname,
    'assets',
    'order-template.xlsx'
  )

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
    let weight = 0
    let length = 0
    let width = 0
    let height = 0
    const orderItems = dto.items.map((item) => {
      const v = variants.find((v) => v.sku === item.sku)!
      const price = Number(v.price)
      const total = price * item.qty
      subtotal += total
      weight += (v.weight ?? 0) * item.qty
      const packed = packDimensions(
        v.length ?? 0,
        v.width ?? 0,
        v.height ?? 0,
        item.qty
      )
      length = Math.max(length, packed.length)
      width = Math.max(width, packed.width)
      height += packed.height
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
        weight,
        length,
        width,
        height,
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

  async findAllForUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: { name: true, quantity: true },
          orderBy: { id: 'asc' }
        },
        payment: { select: { status: true } }
      }
    })

    return orders.map((o) => ({
      id: o.id,
      items: o.items.map((i) => `${i.name} ×${i.quantity}`),
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.payment?.status ?? null,
      trackingCode: o.trackingCode,
      createdAt: o.createdAt
    }))
  }

  async findOneForUser(userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        address: true,
        items: { orderBy: { id: 'asc' } },
        payment: { select: { status: true } }
      }
    })
    if (!order) throw new BadRequestException('Đơn hàng không tồn tại')

    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status ?? null,
      note: order.note,
      trackingCode: order.trackingCode,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discount: Number(order.discount),
      total: Number(order.total),
      createdAt: order.createdAt,
      address: {
        fullName: order.address.fullName,
        phone: order.address.phone,
        email: order.address.email,
        detail: order.address.detail
      },
      items: order.items.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        price: Number(i.price),
        quantity: i.quantity,
        total: Number(i.total)
      }))
    }
  }

  async exportOrdersExcel(status?: string): Promise<ExcelJS.Buffer> {
    const orders = await this.prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        items: { orderBy: { id: 'asc' } }
      }
    })

    // Load SPX's original template file as-is (keeps the rich-text headers,
    // data validation dropdowns, and the State/City/District_list reference
    // sheets) and only fill data into the "Tạo đơn" sheet — so the exported
    // file matches the template exactly, maximizing the odds that uploading
    // it to SPX successfully creates the orders.
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(this.orderTemplatePath)
    const sheet = workbook.getWorksheet('Tạo đơn')
    if (!sheet) {
      throw new Error('Template is missing the "Tạo đơn" sheet')
    }

    let rowIndex = 2
    for (const order of orders) {
      const isCod = order.paymentMethod === PaymentMethod.COD
      const weightKg = order.weight ? order.weight / 1000 : null
      const address = order.address
      const firstItem = order.items[0]

      // 1 order = 1 row. Product name is taken from the first item; we
      // don't split variants into separate rows (Quantity/Price aren't
      // required since "Giao hàng một phần" (partial delivery) is always N).
      // Write cell by cell (not row.values) so we don't touch the hidden
      // formula cells in columns AC/AD (29/30) the template uses for
      // validation.
      const row = sheet.getRow(rowIndex)
      const values = [
        order.id,
        address.fullName,
        address.phone,
        normalizeProvince(address.oldProvince ?? address.province ?? ''),
        (address.oldDistrict ?? '').toUpperCase(),
        address.oldWard ?? address.ward ?? '',
        address.street ?? address.detail,
        null,
        null,
        firstItem.name,
        firstItem.quantity,
        Number(firstItem.price),
        weightKg,
        order.length,
        order.width,
        order.height,
        order.userId,
        Number(order.subtotal),
        'N',
        'N',
        'N',
        'N',
        null,
        isCod ? 'Y' : 'N',
        isCod ? Number(order.subtotal) : null,
        'N',
        isCod ? 'Người nhận trả' : 'Người gửi trả',
        order.note
      ]
      values.forEach((value, i) => {
        row.getCell(i + 1).value = value
      })
      rowIndex++
    }

    const buffer = await workbook.xlsx.writeBuffer()

    if (orders.length > 0) {
      await this.prisma.order.updateMany({
        where: { id: { in: orders.map((o) => o.id) } },
        data: { status: OrderStatus.PROCESSED }
      })
    }

    return buffer
  }

  async findOneAdmin(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        address: true,
        items: { orderBy: { id: 'asc' } },
        payment: { select: { status: true } }
      }
    })
    if (!order) throw new BadRequestException('Đơn hàng không tồn tại')

    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status ?? null,
      note: order.note,
      trackingCode: order.trackingCode,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discount: Number(order.discount),
      total: Number(order.total),
      weight: order.weight,
      length: order.length,
      width: order.width,
      height: order.height,
      createdAt: order.createdAt,
      address: {
        fullName: order.address.fullName,
        phone: order.address.phone,
        email: order.address.email,
        detail: order.address.detail
      },
      items: order.items.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        price: Number(i.price),
        quantity: i.quantity,
        total: Number(i.total)
      }))
    }
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
