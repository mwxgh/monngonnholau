'use client'

import { useEffect, useState } from 'react'
import { fetchAdmin } from '@/lib/fetch-admin'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Analytics {
  statusBreakdown: Record<string, number>
  paymentBreakdown: {
    count: { ONLINE: number; COD: number }
    revenue: { ONLINE: number; COD: number }
  }
  topProducts: {
    name: string
    sku: string
    totalQty: number
    totalRevenue: number
  }[]
  dailyOrders: { date: string; count: number }[]
  totalOrders: number
}

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: 'Chờ TT', color: 'bg-amber-400' },
  PAID: { label: 'Đã TT', color: 'bg-sky-400' },
  PROCESSING: { label: 'Chờ xử lý', color: 'bg-violet-400' },
  SHIPPING: { label: 'Đang giao', color: 'bg-blue-400' },
  DELIVERED: { label: 'Đã giao', color: 'bg-emerald-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-400' },
  REFUNDED: { label: 'Hoàn tiền', color: 'bg-gray-400' }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdmin(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/analytics`
    )
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d?.message ?? `Lỗi ${r.status}`)
        setData(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  if (error || !data)
    return (
      <p className="text-center text-sm text-red-500 pt-20">
        {error || 'Không thể tải dữ liệu'}
      </p>
    )

  const totalOrders = data.totalOrders
  const maxDailyCount = Math.max(...data.dailyOrders.map((d) => d.count), 1)
  const maxProductQty = Math.max(...data.topProducts.map((p) => p.totalQty), 1)
  const onlineTotal =
    data.paymentBreakdown.count.ONLINE + data.paymentBreakdown.count.COD
  const onlinePct =
    onlineTotal > 0
      ? Math.round((data.paymentBreakdown.count.ONLINE / onlineTotal) * 100)
      : 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Phân tích</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Tổng quan chi tiết về đơn hàng và doanh thu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Phân bố {totalOrders} đơn hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.statusBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const meta = STATUS_META[status] ?? {
                  label: status,
                  color: 'bg-gray-400'
                }
                const pct =
                  totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className="font-semibold">
                        {count}{' '}
                        <span className="text-muted-foreground font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          meta.color
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle>Phương thức thanh toán</CardTitle>
            <CardDescription>Online vs COD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Visual split bar */}
            <div className="h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${onlinePct}%` }}
              />
              <div className="bg-orange-400 h-full flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Online (QR/chuyển khoản)',
                  color: 'bg-sky-400',
                  count: data.paymentBreakdown.count.ONLINE,
                  revenue: data.paymentBreakdown.revenue.ONLINE,
                  pct: onlinePct
                },
                {
                  label: 'COD (nhận hàng)',
                  color: 'bg-orange-400',
                  count: data.paymentBreakdown.count.COD,
                  revenue: data.paymentBreakdown.revenue.COD,
                  pct: 100 - onlinePct
                }
              ].map(({ label, color, count, revenue, pct }) => (
                <div key={label} className="rounded-xl border p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn('w-2.5 h-2.5 rounded-full shrink-0', color)}
                    />
                    <p className="text-xs text-muted-foreground leading-tight">
                      {label}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {count}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({pct}%)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Doanh thu:{' '}
                    <span className="font-medium text-foreground">
                      {formatVND(revenue)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily orders - last 30 days */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng 30 ngày gần đây</CardTitle>
            <CardDescription>Mỗi cột = 1 ngày</CardDescription>
          </CardHeader>
          <CardContent>
            {data.dailyOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="flex items-end gap-0.5 h-36">
                {data.dailyOrders.map(({ date, count }) => (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  >
                    <div
                      className="w-full bg-primary/70 rounded-t-sm hover:bg-primary transition-colors cursor-default"
                      style={{ height: `${(count / maxDailyCount) * 100}%` }}
                      title={`${new Date(date).toLocaleDateString('vi-VN')}: ${count} đơn`}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <CardDescription>Top 5 theo số lượng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có dữ liệu
              </p>
            ) : (
              data.topProducts.map((p, i) => (
                <div key={p.sku} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[70%]">
                      <span className="font-semibold text-foreground mr-1.5">
                        {i + 1}.
                      </span>
                      {p.name}
                    </span>
                    <span className="font-semibold shrink-0">
                      {p.totalQty}{' '}
                      <span className="text-muted-foreground font-normal">
                        sp
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all"
                      style={{
                        width: `${(p.totalQty / maxProductQty) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right">
                    {formatVND(p.totalRevenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
