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

interface AdminOrder {
  id: number
  customerName: string
  phone: string
  items: string[]
  total: number
  status: string
  paymentMethod: string
  paymentStatus: string | null
  createdAt: string
}

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING_PAYMENT', label: 'Chờ TT' },
  { value: 'PAID', label: 'Đã TT' },
  { value: 'PROCESSING', label: 'Chờ xử lý' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' }
]

const STATUS_META: Record<string, { label: string; className: string }> = {
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

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING_PAYMENT: ['PROCESSING', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`)
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function changeStatus(id: number, status: string) {
    setUpdating(id)
    try {
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status })
        }
      )
      const updated = await res.json()
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o))
      )
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Quản lý toàn bộ đơn hàng của cửa hàng.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>{orders.length} đơn hàng</CardDescription>
          </div>
          {/* Status filter */}
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filter === value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {label}
                {value === '' && (
                  <span className="ml-1 font-normal">({orders.length})</span>
                )}
                {value !== '' && (
                  <span className="ml-1 font-normal">
                    ({orders.filter((o) => o.status === value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-xs text-muted-foreground">
                Thử đăng xuất và đăng nhập lại.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left pb-3 font-medium">Mã đơn</th>
                    <th className="text-left pb-3 font-medium">Khách hàng</th>
                    <th className="text-left pb-3 font-medium">Sản phẩm</th>
                    <th className="text-left pb-3 font-medium">Thanh toán</th>
                    <th className="text-right pb-3 font-medium">Tổng</th>
                    <th className="text-left pb-3 font-medium">Ngày đặt</th>
                    <th className="text-center pb-3 font-medium">Trạng thái</th>
                    <th className="text-center pb-3 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((order) => {
                    const s = STATUS_META[order.status] ?? {
                      label: order.status,
                      className: ''
                    }
                    const nextStatuses = NEXT_STATUSES[order.status] ?? []
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 text-xs font-mono text-muted-foreground">
                          #{order.id}
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-sm">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.phone}
                          </p>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground max-w-48">
                          <p className="truncate">{order.items[0]}</p>
                          {order.items.length > 1 && (
                            <p className="text-[11px] text-muted-foreground/70">
                              +{order.items.length - 1} sản phẩm
                            </p>
                          )}
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
                        <td className="py-3 text-right font-semibold text-sm">
                          {formatVND(order.total)}
                        </td>
                        <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {nextStatuses.length > 0 ? (
                            <select
                              disabled={updating === order.id}
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value)
                                  changeStatus(order.id, e.target.value)
                              }}
                              className="text-xs border border-border rounded-md px-2 py-1 bg-background disabled:opacity-50 cursor-pointer"
                            >
                              <option value="">Cập nhật</option>
                              {nextStatuses.map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_META[st]?.label ?? st}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Không có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
