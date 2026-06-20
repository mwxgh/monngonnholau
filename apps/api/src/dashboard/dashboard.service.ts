import { Injectable } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

const PAID_STATUSES: OrderStatus[] = [
  'PAID',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED'
]

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers() {
    const addresses = await this.prisma.address.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { total: true, status: true, createdAt: true }
        }
      }
    })

    // Group by phone — keep latest address per phone
    const phoneMap = new Map<string, (typeof addresses)[0]>()
    for (const a of addresses) {
      if (!phoneMap.has(a.phone)) phoneMap.set(a.phone, a)
      else {
        const existing = phoneMap.get(a.phone)!
        // Merge orders
        existing.orders = [...existing.orders, ...a.orders]
      }
    }

    return Array.from(phoneMap.values())
      .map((a) => ({
        fullName: a.fullName,
        phone: a.phone,
        email: a.email,
        totalOrders: a.orders.length,
        totalSpent: a.orders
          .filter((o) =>
            ['PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(o.status)
          )
          .reduce((s, o) => s + Number(o.total), 0),
        lastOrderAt:
          a.orders.length > 0
            ? a.orders.reduce(
                (latest, o) => (o.createdAt > latest ? o.createdAt : latest),
                a.orders[0].createdAt
              )
            : null
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)
  }

  async getAnalytics() {
    const [orders, topItems] = await Promise.all([
      this.prisma.order.findMany({
        select: {
          status: true,
          paymentMethod: true,
          total: true,
          createdAt: true
        }
      }),

      this.prisma.orderItem.groupBy({
        by: ['name', 'sku'],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ])

    // Status breakdown
    const statusCount: Record<string, number> = {}
    for (const o of orders) {
      statusCount[o.status] = (statusCount[o.status] ?? 0) + 1
    }

    // Payment method breakdown
    const paymentCount = { ONLINE: 0, COD: 0 }
    const paymentRevenue = { ONLINE: 0, COD: 0 }
    for (const o of orders) {
      const m = o.paymentMethod as 'ONLINE' | 'COD'
      paymentCount[m] = (paymentCount[m] ?? 0) + 1
      if (['PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(o.status)) {
        paymentRevenue[m] = (paymentRevenue[m] ?? 0) + Number(o.total)
      }
    }

    // Last 30 days daily orders
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyMap = new Map<string, number>()
    for (const o of orders) {
      if (o.createdAt >= thirtyDaysAgo) {
        const day = o.createdAt.toISOString().slice(0, 10)
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
      }
    }
    const dailyOrders = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return {
      statusBreakdown: statusCount,
      paymentBreakdown: { count: paymentCount, revenue: paymentRevenue },
      topProducts: topItems.map((i) => ({
        name: i.name,
        sku: i.sku,
        totalQty: i._sum.quantity ?? 0,
        totalRevenue: Number(i._sum.total ?? 0)
      })),
      dailyOrders,
      totalOrders: orders.length
    }
  }

  async getSettings() {
    const rows = await this.prisma.setting.findMany()
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  async getPublicSettings() {
    const keys = ['shipping_fee', 'shipping_eta', 'store_name', 'store_phone']
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: keys } }
    })
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  async updateSettings(data: Record<string, string>) {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value }
        })
      )
    )
    return this.getSettings()
  }

  async getStats() {
    const year = new Date().getFullYear()
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year + 1, 0, 1)

    const [
      revenueAgg,
      totalOrders,
      totalProducts,
      addresses,
      yearOrders,
      recentOrders
    ] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: PAID_STATUSES } }
      }),

      this.prisma.order.count(),

      this.prisma.product.count({ where: { status: 'ACTIVE' } }),

      // Unique customers by phone
      this.prisma.address.findMany({ select: { phone: true } }),

      // All paid orders this year — group in JS
      this.prisma.order.findMany({
        where: {
          status: { in: PAID_STATUSES },
          createdAt: { gte: yearStart, lt: yearEnd }
        },
        select: { total: true, createdAt: true }
      }),

      // 10 most recent orders
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          total: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          address: { select: { fullName: true } },
          items: {
            take: 1,
            select: { name: true },
            orderBy: { id: 'asc' }
          }
        }
      })
    ])

    // Group monthly revenue in JS
    const monthlyMap = new Map<number, number>()
    for (const o of yearOrders) {
      const m = new Date(o.createdAt).getMonth() + 1
      monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + Number(o.total))
    }
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: monthlyMap.get(i + 1) ?? 0
    }))

    // Unique phones
    const uniquePhones = new Set(addresses.map((a) => a.phone)).size

    return {
      stats: {
        totalRevenue: Number(revenueAgg._sum?.total ?? 0),
        totalOrders,
        totalProducts,
        totalCustomers: uniquePhones
      },
      monthlyRevenue,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.address.fullName,
        firstItem: o.items[0]?.name ?? '—',
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt
      }))
    }
  }
}
