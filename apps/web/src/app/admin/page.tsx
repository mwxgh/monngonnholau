'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight
} from 'lucide-react'
import { fetchAdmin } from '@/lib/fetch-admin'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'

// ── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
}

interface MonthlyRevenue {
  month: number
  revenue: number
}

interface RecentOrder {
  id: number
  customerName: string
  firstItem: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  monthlyRevenue: MonthlyRevenue[]
  recentOrders: RecentOrder[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

const MONTH_LABELS = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12'
]

const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: 'Chờ TT',
    className: 'text-amber-700 bg-amber-50 border border-amber-200'
  },
  PAID: {
    label: 'Đã TT',
    className: 'text-sky-700 bg-sky-50 border border-sky-200'
  },
  PROCESSING: {
    label: 'Chờ xử lý',
    className: 'text-violet-700 bg-violet-50 border border-violet-200'
  },
  SHIPPING: {
    label: 'Đang giao',
    className: 'text-blue-700 bg-blue-50 border border-blue-200'
  },
  DELIVERED: {
    label: 'Đã giao',
    className: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'text-red-700 bg-red-50 border border-red-200'
  },
  REFUNDED: {
    label: 'Hoàn tiền',
    className: 'text-gray-700 bg-gray-50 border border-gray-200'
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error('API error')
        return r.json() as Promise<DashboardData>
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-muted-foreground">
          Không thể tải dữ liệu dashboard.
        </p>
        <button
          onClick={() => {
            setError(false)
            setLoading(true)
          }}
          className="text-sm text-primary underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const { stats, monthlyRevenue, recentOrders } = data
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1)
  const currentYear = new Date().getFullYear()

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatVND(stats.totalRevenue),
      description: 'từ đơn đã thanh toán',
      icon: TrendingUp
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders.toLocaleString('vi-VN'),
      description: 'tổng số đơn',
      icon: ShoppingCart
    },
    {
      title: 'Sản phẩm',
      value: stats.totalProducts.toLocaleString('vi-VN'),
      description: 'đang bán',
      icon: Package
    },
    {
      title: 'Khách hàng',
      value: stats.totalCustomers.toLocaleString('vi-VN'),
      description: 'số điện thoại duy nhất',
      icon: Users
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Chào mừng trở lại! Đây là tổng quan hoạt động của cửa hàng.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{value}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue bar chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>
              Năm {currentYear} — đơn vị: nghìn ₫
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-44 mt-2">
              {monthlyRevenue.map(({ month, revenue }) => (
                <div
                  key={month}
                  className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
                >
                  <div
                    className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-colors cursor-default"
                    style={{
                      height: `${Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 2 : 0)}%`
                    }}
                    title={formatVND(revenue)}
                  />
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {MONTH_LABELS[month - 1]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent orders mini */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>10 đơn mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => {
                const s = ORDER_STATUS[order.status] ?? {
                  label: order.status,
                  className: ''
                }
                return (
                  <div key={order.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                      {order.customerName.split(' ').at(-1)![0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate leading-tight">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {order.firstItem}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs font-semibold">
                        {formatVND(order.total)}
                      </p>
                      <span
                        className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${s.className}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả đơn hàng gần đây</CardTitle>
          <CardDescription>10 đơn hàng mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Mã đơn</th>
                  <th className="text-left pb-3 font-medium">Khách hàng</th>
                  <th className="text-left pb-3 font-medium">Sản phẩm</th>
                  <th className="text-left pb-3 font-medium">Thanh toán</th>
                  <th className="text-right pb-3 font-medium">Tổng tiền</th>
                  <th className="text-center pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => {
                  const s = ORDER_STATUS[order.status] ?? {
                    label: order.status,
                    className: ''
                  }
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 text-xs font-mono text-muted-foreground">
                        #{order.id}
                      </td>
                      <td className="py-3 font-medium">{order.customerName}</td>
                      <td className="py-3 text-muted-foreground text-xs truncate max-w-50">
                        {order.firstItem}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            order.paymentMethod === 'COD'
                              ? 'text-orange-700 bg-orange-50 border border-orange-200'
                              : 'text-sky-700 bg-sky-50 border border-sky-200'
                          }`}
                        >
                          {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatVND(order.total)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
