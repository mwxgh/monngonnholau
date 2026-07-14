'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { fetchAdmin } from '@/lib/fetch-admin'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { AdminCreateOrderDialog } from '@/components/order/admin-create-order-dialog'
import { ShipOrderDialog } from '@/components/order/ship-order-dialog'

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

interface OrderDetail {
  id: number
  status: string
  paymentMethod: string
  paymentStatus: string | null
  note: string | null
  trackingCode: string | null
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  createdAt: string
  address: {
    fullName: string
    phone: string
    email: string | null
    detail: string
  }
  items: {
    id: number
    name: string
    sku: string
    price: number
    quantity: number
    total: number
  }[]
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
  { value: 'PROCESSED', label: 'Đã xử lý' },
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
  PROCESSED: {
    label: 'Đã xử lý',
    className: 'text-cyan-700 bg-cyan-50 border border-cyan-200'
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
  PROCESSING: ['PROCESSED', 'CANCELLED'],
  PROCESSED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: []
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null)
  const [detailRefreshToken, setDetailRefreshToken] = useState(0)

  async function quickAdvance(order: AdminOrder) {
    const next = NEXT_STATUSES[order.status]?.[0]
    if (!next) return
    if (next === 'SHIPPING') {
      setShippingOrderId(order.id)
      return
    }
    setAdvancing(order.id)
    try {
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/${order.id}/status`,
        { method: 'PATCH', body: JSON.stringify({ status: next }) }
      )
      const updated = await res.json()
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: updated.status } : o
        )
      )
    } finally {
      setAdvancing(null)
    }
  }

  function loadOrders() {
    return fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`)
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    loadOrders().finally(() => setLoading(false))
  }, [])

  async function exportExcel() {
    setExporting(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/export${params}`
      )
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `don-hang-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      // Backend đã tự chuyển các đơn vừa xuất sang "Đã xử lý" — tải lại danh sách
      await loadOrders()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xuất file thất bại')
    } finally {
      setExporting(false)
    }
  }

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-row items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý toàn bộ đơn hàng của cửa hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white hover:opacity-90"
          >
            + Tạo đơn hàng
          </button>
          {filter === 'PROCESSING' && (
            <button
              onClick={exportExcel}
              disabled={exporting || orders.length === 0}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-background hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          )}
        </div>
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
                    <th className="text-left pb-3 pr-4 font-medium">Mã đơn</th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Khách hàng
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Sản phẩm
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Thanh toán
                    </th>
                    <th className="text-right pb-3 pr-4 font-medium">Tổng</th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Ngày đặt
                    </th>
                    <th className="text-center pb-3 pr-4 font-medium">
                      Trạng thái
                    </th>
                    <th className="text-center pb-3 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((order) => {
                    const s = STATUS_META[order.status] ?? {
                      label: order.status,
                      className: ''
                    }
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">
                          #{order.id}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-sm">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.phone}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground max-w-48">
                          <p className="truncate">{order.items[0]}</p>
                          {order.items.length > 1 && (
                            <p className="text-[11px] text-muted-foreground/70">
                              +{order.items.length - 1} sản phẩm
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4">
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
                        <td className="py-3 pr-4 text-right font-semibold text-sm">
                          {formatVND(order.total)}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {(() => {
                            const next = NEXT_STATUSES[order.status]?.[0]
                            const nextLabel = next
                              ? (STATUS_META[next]?.label ?? next)
                              : null
                            return (
                              <button
                                onClick={() => quickAdvance(order)}
                                disabled={!next || advancing === order.id}
                                title={
                                  nextLabel
                                    ? `Chuyển nhanh sang "${nextLabel}"`
                                    : undefined
                                }
                                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className} ${
                                  next
                                    ? 'cursor-pointer hover:opacity-75'
                                    : 'cursor-default'
                                } disabled:opacity-60`}
                              >
                                {advancing === order.id ? '...' : s.label}
                              </button>
                            )
                          })()}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => setDetailId(order.id)}
                            title="Xem chi tiết"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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

      <OrderDetailDialog
        orderId={detailId}
        onClose={() => setDetailId(null)}
        onStatusUpdated={(id, status) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
          )
        }}
        onRequestShip={(id) => setShippingOrderId(id)}
        refreshToken={detailRefreshToken}
      />

      <AdminCreateOrderDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={loadOrders}
      />

      <ShipOrderDialog
        orderId={shippingOrderId}
        onClose={() => setShippingOrderId(null)}
        onShipped={(id, status) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
          )
          if (id === detailId) setDetailRefreshToken((t) => t + 1)
        }}
      />
    </div>
  )
}

function OrderDetailDialog({
  orderId,
  onClose,
  onStatusUpdated,
  onRequestShip,
  refreshToken
}: {
  orderId: number | null
  onClose: () => void
  onStatusUpdated: (id: number, status: string) => void
  onRequestShip: (id: number) => void
  refreshToken: number
}) {
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  // Đang tải khi đã chọn đơn nhưng detail hiện có chưa khớp id đó và chưa lỗi
  const loading = orderId !== null && !error && detail?.id !== orderId

  useEffect(() => {
    if (orderId === null) return
    fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/${orderId}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`)
        setError('')
        setDetail(data)
      })
      .catch((e) => setError(e.message))
  }, [orderId, refreshToken])

  async function changeStatus(status: string) {
    if (!detail) return
    setUpdating(true)
    try {
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/${detail.id}/status`,
        { method: 'PATCH', body: JSON.stringify({ status }) }
      )
      const updated = await res.json()
      setDetail((prev) => (prev ? { ...prev, status: updated.status } : prev))
      onStatusUpdated(detail.id, updated.status)
    } finally {
      setUpdating(false)
    }
  }

  const nextStatuses = detail ? (NEXT_STATUSES[detail.status] ?? []) : []

  return (
    <Dialog
      open={orderId !== null}
      onOpenChange={(o) => {
        if (o) return
        onClose()
        setDetail(null)
        setError('')
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đơn hàng #{orderId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-4">{error}</p>
        ) : detail ? (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  STATUS_META[detail.status]?.className ?? ''
                }`}
              >
                {STATUS_META[detail.status]?.label ?? detail.status}
              </span>
              {nextStatuses.length > 0 && (
                <select
                  disabled={updating}
                  defaultValue=""
                  onChange={(e) => {
                    const value = e.target.value
                    if (!value) return
                    if (value === 'SHIPPING') {
                      onRequestShip(detail.id)
                      e.target.value = ''
                      return
                    }
                    changeStatus(value)
                  }}
                  className="text-xs border border-border rounded-md px-2 py-1 bg-background disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Cập nhật trạng thái</option>
                  {nextStatuses.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_META[st]?.label ?? st}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Người nhận
              </p>
              <p className="font-medium">{detail.address.fullName}</p>
              <p className="text-muted-foreground">{detail.address.phone}</p>
              {detail.address.email && (
                <p className="text-muted-foreground">{detail.address.email}</p>
              )}
              <p className="text-muted-foreground mt-0.5">
                {detail.address.detail}
              </p>
            </div>

            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1.5">
                Sản phẩm
              </p>
              <div className="space-y-1.5">
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium whitespace-nowrap">
                      {formatVND(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatVND(detail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí ship</span>
                <span>{formatVND(detail.shippingFee)}</span>
              </div>
              {detail.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Giảm giá</span>
                  <span>-{formatVND(detail.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(detail.total)}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-xs">
              <span>
                Thanh toán:{' '}
                <span className="font-medium text-foreground">
                  {detail.paymentMethod === 'COD' ? 'COD' : 'Online'}
                  {detail.paymentStatus ? ` (${detail.paymentStatus})` : ''}
                </span>
              </span>
              {detail.weight != null && (
                <span>
                  Cân nặng:{' '}
                  <span className="font-medium text-foreground">
                    {(detail.weight / 1000).toFixed(2)} kg
                  </span>
                </span>
              )}
              {detail.length != null && (
                <span>
                  Kích thước:{' '}
                  <span className="font-medium text-foreground">
                    {detail.length} × {detail.width} × {detail.height} cm
                  </span>
                </span>
              )}
              {detail.trackingCode && (
                <span>
                  Mã vận đơn:{' '}
                  <span className="font-medium text-foreground">
                    {detail.trackingCode}
                  </span>
                </span>
              )}
            </div>

            {detail.note && (
              <div className="border-t pt-3">
                <p className="font-medium text-xs text-muted-foreground mb-1">
                  Ghi chú
                </p>
                <p>{detail.note}</p>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
