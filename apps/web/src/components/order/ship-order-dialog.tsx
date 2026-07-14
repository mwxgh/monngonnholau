'use client'

import { useEffect, useState } from 'react'
import { fetchAdmin } from '@/lib/fetch-admin'
import { showToast } from '@/lib/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AcInput } from '@/components/ui/ac-input'

export function ShipOrderDialog({
  orderId,
  onClose,
  onShipped
}: {
  orderId: number | null
  onClose: () => void
  onShipped: (id: number, status: string) => void
}) {
  const [trackingCode, setTrackingCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId === null) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrackingCode('')
    setError('')
  }, [orderId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (orderId === null) return
    const code = trackingCode.trim()
    if (!code) {
      setError('Vui lòng nhập mã vận đơn')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'SHIPPING', trackingCode: code })
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? `Lỗi ${res.status}`)
        return
      }
      showToast(
        'success',
        'Đã chuyển sang Đang giao',
        'Email thông báo đã được gửi lại cho khách hàng'
      )
      onShipped(orderId, data.status)
      onClose()
    } catch {
      setError('Không thể kết nối đến máy chủ.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={orderId !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nhập mã vận đơn</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">
              Mã vận đơn <span className="text-primary">*</span>
            </label>
            <AcInput
              autoFocus
              placeholder="VD: SPXVN012345678***"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
            {error && (
              <p className="text-xs font-medium text-destructive">{error}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái &quot;Đang
            giao&quot; và email thông báo sẽ được gửi lại cho khách hàng.
          </p>
          <Button type="submit" disabled={submitting} className="w-full h-10">
            {submitting ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
