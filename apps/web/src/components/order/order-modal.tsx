'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, CreditCard, Minus, Plus, Truck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { AcInput } from '@/components/ui/ac-input'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

// ── Types ──────────────────────────────────────────────────────────────────

interface Variant {
  id: number
  sku: string
  name: string
  price: string
  comparePrice: string | null
  inventory: { quantity: number } | null
}

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  variants: Variant[]
}

interface Province {
  code: number
  name: string
}

interface District {
  code: number
  name: string
}

interface Ward {
  code: number
  name: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

// "old" = Tỉnh → Huyện → Xã  |  "new" = Tỉnh → Xã (bỏ cấp huyện)
const ADDRESS_MODE = (process.env.NEXT_PUBLIC_ADDRESS_FORM ?? 'old') as
  | 'old'
  | 'new'

// v1: trước sáp nhập tỉnh thành 07/2025  |  v2: sau sáp nhập
const PROVINCES_API =
  ADDRESS_MODE === 'old'
    ? 'https://provinces.open-api.vn/api/v1'
    : 'https://provinces.open-api.vn/api/v2'

// ── Schema ─────────────────────────────────────────────────────────────────

const infoSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().regex(/^(0[3-9])\d{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.email('Email không hợp lệ').optional().or(z.literal('')),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district:
    ADDRESS_MODE === 'old'
      ? z.string().min(1, 'Vui lòng chọn quận/huyện')
      : z.string().optional(),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập số nhà, tên đường'),
  note: z.string().optional()
})

type InfoValues = z.infer<typeof infoSchema>

// ── Address Select ─────────────────────────────────────────────────────────

function AddressSelect({
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading,
  error
}: {
  placeholder: string
  options: { code: number; name: string }[]
  value: string
  onChange: (name: string, code: number) => void
  disabled?: boolean
  loading?: boolean
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'rounded-lg p-0.5 transition duration-300',
          error ? 'bg-red-400/60' : 'bg-transparent'
        )}
      >
        <select
          value={value}
          onChange={(e) => {
            const selected = options.find((o) => o.name === e.target.value)
            if (selected) onChange(selected.name, selected.code)
          }}
          disabled={disabled || loading}
          className={cn(
            'flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black',
            'shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]',
            'focus:outline-none focus:ring-2 focus:ring-neutral-400 transition duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <option value="">{loading ? 'Đang tải...' : placeholder}</option>
          {options.map((o) => (
            <option key={o.code} value={o.name}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────

// ── PaymentStep ────────────────────────────────────────────────────────────

function PaymentStep({
  info,
  onPaid,
  onSkip,
  checking,
  setChecking
}: {
  info: PaymentInfo
  onPaid: () => void
  onSkip: () => void
  checking: boolean
  setChecking: (v: boolean) => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  // Poll payment status every 3s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${info.orderId}/payment-status`
        )
        const data = await res.json()
        if (data.paymentStatus === 'PAID' || data.orderStatus === 'PAID') {
          clearInterval(interval)
          onPaid()
        }
      } catch {
        // ignore
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [info.orderId, onPaid])

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const expired = secondsLeft === 0

  return (
    <div className="flex flex-col max-h-[90vh]">
      <div className="px-6 pt-6 pb-4 border-b shrink-0">
        <h2 className="text-xl font-bold text-neutral-800">
          Thanh toán đơn hàng
        </h2>
        <p className="mt-0.5 text-sm text-neutral-500">
          Quét mã QR để thanh toán — đơn hàng{' '}
          <span className="font-medium">#{info.orderId}</span>
        </p>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col items-center gap-4">
        {/* QR code */}
        <div className="relative">
          <div
            className={cn(
              'p-3 rounded-xl border bg-white',
              expired && 'opacity-30'
            )}
          >
            <QRCodeSVG value={info.qrCode} size={208} />
          </div>
          {expired && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
              <p className="text-sm font-semibold text-red-500">
                QR đã hết hạn
              </p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {formatVND(info.total)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng thanh toán
          </p>
        </div>

        {/* Timer */}
        {!expired && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            QR hết hạn sau{' '}
            <span className="font-mono font-semibold text-foreground">
              {mins}:{secs}
            </span>
          </div>
        )}

        {/* Polling indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Đang chờ xác nhận thanh toán...
        </div>

        {/* Open in browser */}
        <a
          href={info.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
        >
          Mở trang thanh toán trong trình duyệt →
        </a>

        {/* Manual check */}
        <button
          type="button"
          disabled={checking}
          onClick={async () => {
            setChecking(true)
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${info.orderId}/payment-status`
              )
              const data = await res.json()
              if (data.paymentStatus === 'PAID' || data.orderStatus === 'PAID')
                onPaid()
            } catch {
              // ignore
            } finally {
              setChecking(false)
            }
          }}
          className="h-9 px-5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50 transition-colors"
        >
          {checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
        </button>
      </div>

      <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
        <button
          type="button"
          onClick={onSkip}
          className="w-full h-9 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
        >
          Thanh toán sau (COD / chuyển khoản thủ công)
        </button>
      </div>
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────

interface OrderModalProps {
  open: boolean
  onClose: () => void
  initialView?: 'browse' | 'cart'
}

// ── Component ──────────────────────────────────────────────────────────────

interface PaymentInfo {
  qrCode: string
  checkoutUrl: string
  orderId: number
  total: number
}

export function OrderModal({
  open,
  onClose,
  initialView = 'browse'
}: OrderModalProps) {
  const savedCart = useCart()
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1)
  const [view, setView] = useState<'browse' | 'cart'>(initialView)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState(false)
  const [cart, setCart] = useState<
    Record<number, { selectedSku: string; qty: number }>
  >({})

  // Reset to the requested view every time the modal opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setView(initialView)
  }, [open, initialView])

  // Address data
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [shippingFee, setShippingFee] = useState(30000)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE')

  // Submit
  const [serverError, setServerError] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [paymentChecking, setPaymentChecking] = useState(false)

  const form = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      note: ''
    }
  })

  function loadProducts() {
    setLoadingProducts(true)
    setProductsError(false)

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`).then((r) => {
        if (!r.ok) throw new Error('API error')
        return r.json() as Promise<Product[]>
      }),
      fetch(`${PROVINCES_API}/p/`).then((r) => r.json() as Promise<Province[]>),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/public-settings`
      )
        .then((r) => r.json())
        .catch(() => ({}))
    ])
      .then(([productData, provinceData, settings]) => {
        setProducts(productData)
        setProvinces(provinceData)
        if (settings?.shipping_fee)
          setShippingFee(Number(settings.shipping_fee))
        const init: Record<number, { selectedSku: string; qty: number }> = {}
        productData.forEach((p) => {
          if (p.variants.length === 0) return
          const saved = savedCart.items.find((i) => i.productId === p.id)
          const selectedSku = saved
            ? (p.variants.find((v) => v.sku === saved.sku)?.sku ??
              p.variants[0].sku)
            : p.variants[0].sku
          init[p.id] = { selectedSku, qty: saved?.qty ?? 0 }
        })
        setCart(init)
      })
      .catch(() => setProductsError(true))
      .finally(() => setLoadingProducts(false))
  }

  // Fetch products + provinces when modal opens
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [open])

  // Load address options when province changes
  useEffect(() => {
    if (!selectedProvinceCode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWards([])
    form.setValue('district', '')
    form.setValue('ward', '')

    if (ADDRESS_MODE === 'old') {
      setLoadingDistricts(true)
      setDistricts([])
      setSelectedDistrictCode(null)
      fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`)
        .then((r) => r.json())
        .then((data) => setDistricts(data.districts ?? []))
        .catch(() => {})
        .finally(() => setLoadingDistricts(false))
    } else {
      // new mode (v2): tỉnh → xã trực tiếp, depth=2 là đủ
      setLoadingWards(true)
      fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`)
        .then((r) => r.json())
        .then((data) => setWards(data.wards ?? []))
        .catch(() => {})
        .finally(() => setLoadingWards(false))
    }
  }, [selectedProvinceCode, form])

  // Load wards when district changes (old mode only)
  useEffect(() => {
    if (ADDRESS_MODE !== 'old' || !selectedDistrictCode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingWards(true)
    setWards([])
    form.setValue('ward', '')

    fetch(`${PROVINCES_API}/d/${selectedDistrictCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? []))
      .catch(() => {})
      .finally(() => setLoadingWards(false))
  }, [selectedDistrictCode, form])

  function handleClose() {
    onClose()
    setTimeout(() => {
      setStep(1)
      setServerError('')
      setOrderId(null)
      setPaymentInfo(null)
      setPaymentMethod('ONLINE')
      setSelectedProvinceCode(null)
      setSelectedDistrictCode(null)
      setDistricts([])
      setWards([])
      form.reset()
    }, 300)
  }

  // Cart helpers
  function setQty(productId: number, delta: number) {
    setCart((prev) => {
      const row = prev[productId]
      if (!row) return prev
      const product = products.find((p) => p.id === productId)
      const variant = product?.variants.find((v) => v.sku === row.selectedSku)
      const max = variant?.inventory?.quantity ?? 99
      return {
        ...prev,
        [productId]: {
          ...row,
          qty: Math.min(Math.max(0, row.qty + delta), max)
        }
      }
    })
  }

  function setSku(productId: number, sku: string) {
    setCart((prev) => ({ ...prev, [productId]: { selectedSku: sku, qty: 0 } }))
  }

  const cartItems = products.flatMap((p) => {
    const row = cart[p.id]
    if (!row || row.qty === 0) return []
    const variant = p.variants.find((v) => v.sku === row.selectedSku)
    if (!variant) return []
    return [
      {
        sku: row.selectedSku,
        qty: row.qty,
        price: Number(variant.price),
        variantName: variant.name,
        productName: p.name
      }
    ]
  })

  // Keep the persisted cart (localStorage) in sync while the picker is open
  useEffect(() => {
    if (!open || loadingProducts) return
    const next = Object.entries(cart)
      .filter(([, row]) => row.qty > 0)
      .map(([productId, row]) => ({
        productId: Number(productId),
        sku: row.selectedSku,
        qty: row.qty
      }))
    savedCart.replaceAll(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, open, loadingProducts])

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const total = subtotal + shippingFee
  const hasItems = cartItems.length > 0

  async function handleSubmit(values: InfoValues) {
    setServerError('')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/quick`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            province: values.province,
            district: values.district,
            ward: values.ward,
            street: values.street,
            note: values.note || undefined,
            items: cartItems.map((i) => ({ sku: i.sku, qty: i.qty })),
            paymentMethod
          })
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message ?? 'Đặt hàng thất bại.')
        return
      }
      setOrderId(data.orderId)
      savedCart.clear()
      if (data.qrCode) {
        setPaymentInfo({
          qrCode: data.qrCode,
          checkoutUrl: data.checkoutUrl,
          orderId: data.orderId,
          total: data.total
        })
        setStep(3)
      } else {
        setStep('success')
      }
    } catch {
      setServerError('Không thể kết nối đến máy chủ.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton
        className="p-0 overflow-hidden max-w-xl w-full"
      >
        {/* ── Step 1: Chọn sản phẩm ──────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <h2 className="text-xl font-bold text-neutral-800">
                {view === 'cart' ? 'Giỏ hàng của bạn' : 'Đặt hàng nhanh'}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {view === 'cart'
                  ? 'Sản phẩm bạn đã thêm vào giỏ'
                  : 'Chọn sản phẩm và số lượng bạn muốn đặt'}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {loadingProducts ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : productsError ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Không thể tải sản phẩm. Vui lòng thử lại.
                  </p>
                  <button
                    type="button"
                    onClick={loadProducts}
                    className="h-8 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              ) : view === 'cart' &&
                products.every((p) => (cart[p.id]?.qty ?? 0) === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Giỏ hàng của bạn đang trống.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('browse')}
                    className="h-8 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products
                    .filter((product) =>
                      view === 'cart' ? (cart[product.id]?.qty ?? 0) > 0 : true
                    )
                    .map((product) => {
                      const row = cart[product.id]
                      if (!row) return null
                      const variant = product.variants.find(
                        (v) => v.sku === row.selectedSku
                      )
                      const price = variant ? Number(variant.price) : 0
                      const comparePrice = variant?.comparePrice
                        ? Number(variant.comparePrice)
                        : null
                      return (
                        <div
                          key={product.id}
                          className={cn(
                            'rounded-xl border p-4 transition-colors',
                            row.qty > 0
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-border bg-card'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {formatVND(price)}
                              </span>
                              {comparePrice && (
                                <span className="text-xs text-muted-foreground line-through ml-1.5">
                                  {formatVND(comparePrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <select
                              value={row.selectedSku}
                              onChange={(e) =>
                                setSku(product.id, e.target.value)
                              }
                              className="flex-1 min-w-0 h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {product.variants.map((v) => (
                                <option key={v.sku} value={v.sku}>
                                  {v.name} — {formatVND(Number(v.price))}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setQty(product.id, -1)}
                                disabled={row.qty === 0}
                                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium tabular-nums">
                                {row.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(product.id, 1)}
                                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-muted/30 shrink-0 space-y-3">
              {hasItems && (
                <div className="text-sm space-y-1">
                  {cartItems.map((i) => (
                    <div
                      key={i.sku}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {i.productName} {i.variantName} × {i.qty}
                      </span>
                      <span>{formatVND(i.price * i.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí giao hàng</span>
                    <span>{formatVND(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatVND(total)}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                disabled={!hasItems}
                onClick={() => setStep(2)}
                className="w-full h-10 rounded-lg bg-primary text-white font-medium text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
              >
                {hasItems ? 'Tiếp theo →' : 'Chọn ít nhất 1 sản phẩm'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Thông tin giao hàng ────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setServerError('')
                }}
                className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 transition-colors"
              >
                ← Quay lại
              </button>
              <h2 className="text-xl font-bold text-neutral-800">
                Thông tin giao hàng
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                Nhập thông tin để chúng tôi giao hàng đến bạn
              </p>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              <Form {...form}>
                <form
                  id="order-form"
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* Name + Phone */}
                  <div className="flex gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Họ tên <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <AcInput placeholder="Nguyễn Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Số điện thoại{' '}
                            <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <AcInput
                              type="tel"
                              placeholder="0912 345 678"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700">
                          Email
                        </FormLabel>
                        <FormControl>
                          <AcInput
                            type="email"
                            placeholder="email@example.com (tuỳ chọn)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Province */}
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700">
                          Tỉnh / Thành phố{' '}
                          <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <AddressSelect
                            placeholder="Chọn tỉnh/thành phố"
                            options={provinces}
                            value={field.value}
                            onChange={(name, code) => {
                              field.onChange(name)
                              setSelectedProvinceCode(code)
                            }}
                            error={form.formState.errors.province?.message}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* District — old mode only */}
                  {ADDRESS_MODE === 'old' && (
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-700">
                            Quận / Huyện <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <AddressSelect
                              placeholder="Chọn quận/huyện"
                              options={districts}
                              value={field.value ?? ''}
                              onChange={(name, code) => {
                                field.onChange(name)
                                setSelectedDistrictCode(code)
                              }}
                              disabled={!selectedProvinceCode}
                              loading={loadingDistricts}
                              error={form.formState.errors.district?.message}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Ward */}
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700">
                          {ADDRESS_MODE === 'old'
                            ? 'Phường / Xã'
                            : 'Xã / Phường / Thị trấn'}{' '}
                          <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <AddressSelect
                            placeholder={
                              ADDRESS_MODE === 'old'
                                ? 'Chọn phường/xã'
                                : 'Chọn xã/phường/thị trấn'
                            }
                            options={wards}
                            value={field.value}
                            onChange={(name) => field.onChange(name)}
                            disabled={
                              ADDRESS_MODE === 'old'
                                ? !selectedDistrictCode
                                : !selectedProvinceCode
                            }
                            loading={loadingWards}
                            error={form.formState.errors.ward?.message}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Street */}
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700">
                          Số nhà, tên đường{' '}
                          <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <AcInput placeholder="VD: 12 Nguyễn Huệ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Note */}
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700">
                          Ghi chú
                        </FormLabel>
                        <FormControl>
                          <AcInput
                            placeholder="Ghi chú cho đơn hàng (tuỳ chọn)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment method */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">
                      Phương thức thanh toán{' '}
                      <span className="text-primary">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ONLINE')}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors',
                          paymentMethod === 'ONLINE'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <CreditCard
                          className={cn(
                            'w-5 h-5 shrink-0',
                            paymentMethod === 'ONLINE'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        />
                        <div>
                          <p className="text-xs font-semibold leading-tight">
                            Thanh toán ngay
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            Chuyển khoản / QR
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors',
                          paymentMethod === 'COD'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <Truck
                          className={cn(
                            'w-5 h-5 shrink-0',
                            paymentMethod === 'COD'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        />
                        <div>
                          <p className="text-xs font-semibold leading-tight">
                            Thanh toán khi nhận
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            COD
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5 text-sm">
                    {cartItems.map((i) => (
                      <div
                        key={i.sku}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>
                          {i.productName} {i.variantName} × {i.qty}
                        </span>
                        <span>{formatVND(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phí giao hàng</span>
                      <span>{formatVND(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1.5 border-t">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatVND(total)}</span>
                    </div>
                  </div>

                  {serverError && (
                    <p className="text-sm text-red-500 text-center">
                      {serverError}
                    </p>
                  )}
                </form>
              </Form>
            </div>

            <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
              <button
                form="order-form"
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-10 rounded-lg bg-primary text-white font-medium text-sm transition-opacity disabled:opacity-60 hover:opacity-90"
              >
                {form.formState.isSubmitting
                  ? 'Đang đặt hàng...'
                  : paymentMethod === 'ONLINE'
                    ? `Thanh toán ngay — ${formatVND(total)}`
                    : `Đặt hàng (COD) — ${formatVND(total)}`}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: QR thanh toán ──────────────────────────────────── */}
        {step === 3 && paymentInfo && (
          <PaymentStep
            info={paymentInfo}
            onPaid={() => setStep('success')}
            onSkip={() => setStep('success')}
            checking={paymentChecking}
            setChecking={setPaymentChecking}
          />
        )}

        {/* ── Success ──────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center px-8 py-12 text-center gap-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <div>
              <h2 className="text-xl font-bold text-neutral-800">
                Đặt hàng thành công!
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Mã đơn hàng:{' '}
                <span className="font-semibold text-neutral-700">
                  #{orderId}
                </span>
              </p>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              Chúng tôi sẽ liên hệ xác nhận qua số điện thoại bạn đã cung cấp.
              Cảm ơn bạn đã tin tưởng Món Ngon Nhớ Lâu!
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 h-10 px-6 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Đóng
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
