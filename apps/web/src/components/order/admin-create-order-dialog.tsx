'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Minus, Plus } from 'lucide-react'
import { fetchAdmin } from '@/lib/fetch-admin'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { AcInput } from '@/components/ui/ac-input'
import { Button } from '@/components/ui/button'

// ── Types ──────────────────────────────────────────────────────────────────

interface Variant {
  id: number
  sku: string
  name: string
  price: string
  inventory: { quantity: number } | null
}

interface Product {
  id: number
  name: string
  variants: Variant[]
}

interface GeoOption {
  code: number
  name: string
}

// "old" = Tỉnh → Huyện → Xã  |  "new" = Tỉnh → Xã (bỏ cấp huyện)
const ADDRESS_MODE = (process.env.NEXT_PUBLIC_ADDRESS_FORM ?? 'old') as
  | 'old'
  | 'new'
const PROVINCES_API =
  ADDRESS_MODE === 'old'
    ? 'https://provinces.open-api.vn/api/v1'
    : 'https://provinces.open-api.vn/api/v2'

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

// ── Schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
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
  note: z.string().optional(),
  paymentMethod: z.enum(['COD', 'ONLINE']),
  isPrepaid: z.boolean(),
  shippingPayer: z.enum(['SENDER', 'RECEIVER'])
})

type FormValues = z.infer<typeof schema>

function GeoSelect({
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading,
  error
}: {
  placeholder: string
  options: GeoOption[]
  value: string
  onChange: (name: string, code: number) => void
  disabled?: boolean
  loading?: boolean
  error?: string
}) {
  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => {
          const selected = options.find((o) => o.name === e.target.value)
          if (selected) onChange(selected.name, selected.code)
        }}
        disabled={disabled || loading}
        className={cn(
          'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-50',
          error && 'border-destructive'
        )}
      >
        <option value="">{loading ? 'Đang tải...' : placeholder}</option>
        {options.map((o) => (
          <option key={o.code} value={o.name}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export function AdminCreateOrderDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [cart, setCart] = useState<
    Record<number, { sku: string; qty: number }>
  >({})
  const [provinces, setProvinces] = useState<GeoOption[]>([])
  const [districts, setDistricts] = useState<GeoOption[]>([])
  const [wards, setWards] = useState<GeoOption[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      note: '',
      paymentMethod: 'COD',
      isPrepaid: false,
      shippingPayer: 'RECEIVER'
    }
  })

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProducts(true)
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`).then((r) =>
        r.json()
      ),
      fetch(`${PROVINCES_API}/p/`).then((r) => r.json())
    ])
      .then(([productData, provinceData]) => {
        setProducts(productData)
        setProvinces(provinceData)
      })
      .catch(() =>
        showToast('error', 'Lỗi', 'Không thể tải sản phẩm hoặc tỉnh/thành')
      )
      .finally(() => setLoadingProducts(false))
  }, [open])

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
      setLoadingWards(true)
      fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`)
        .then((r) => r.json())
        .then((data) => setWards(data.wards ?? []))
        .catch(() => {})
        .finally(() => setLoadingWards(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceCode])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictCode])

  function reset() {
    setCart({})
    setProvinces([])
    setDistricts([])
    setWards([])
    setSelectedProvinceCode(null)
    setSelectedDistrictCode(null)
    form.reset()
  }

  function handleClose() {
    onClose()
    setTimeout(reset, 300)
  }

  function setQty(productId: number, sku: string, delta: number) {
    setCart((prev) => {
      const row = prev[productId]
      const qty = Math.max(0, (row?.qty ?? 0) + delta)
      return { ...prev, [productId]: { sku, qty } }
    })
  }

  const cartItems = products.flatMap((p) => {
    const row = cart[p.id]
    if (!row || row.qty === 0) return []
    const variant = p.variants.find((v) => v.sku === row.sku)
    if (!variant) return []
    return [
      {
        sku: row.sku,
        qty: row.qty,
        price: Number(variant.price),
        productName: p.name,
        variantName: variant.name
      }
    ]
  })
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const hasItems = cartItems.length > 0

  async function handleSubmit(values: FormValues) {
    if (!hasItems) {
      showToast(
        'error',
        'Chưa chọn sản phẩm',
        'Vui lòng chọn ít nhất 1 sản phẩm'
      )
      return
    }
    setSubmitting(true)
    try {
      const res = await fetchAdmin(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin`,
        {
          method: 'POST',
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
            paymentMethod: values.paymentMethod,
            isPrepaid: values.isPrepaid,
            shippingPayer: values.shippingPayer
          })
        }
      )
      const data = await res.json()
      if (!res.ok) {
        showToast('error', 'Tạo đơn thất bại', data.message)
        return
      }
      showToast('success', 'Tạo đơn thành công', `Mã đơn hàng #${data.orderId}`)
      onCreated()
      handleClose()
    } catch {
      showToast('error', 'Tạo đơn thất bại', 'Không thể kết nối đến máy chủ.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng</DialogTitle>
        </DialogHeader>

        {loadingProducts ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              {/* Products */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">
                  Sản phẩm <span className="text-primary">*</span>
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {products.map((product) => {
                    if (product.variants.length === 0) return null
                    const row = cart[product.id]
                    const sku = row?.sku ?? product.variants[0].sku
                    const qty = row?.qty ?? 0
                    const variant =
                      product.variants.find((v) => v.sku === sku) ??
                      product.variants[0]
                    return (
                      <div
                        key={product.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-2',
                          qty > 0
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatVND(Number(variant.price))}
                          </p>
                        </div>
                        <select
                          value={sku}
                          onChange={(e) =>
                            setCart((prev) => ({
                              ...prev,
                              [product.id]: {
                                sku: e.target.value,
                                qty: prev[product.id]?.qty ?? 0
                              }
                            }))
                          }
                          className="h-8 rounded-md border border-input bg-background px-1.5 text-xs max-w-28"
                        >
                          {product.variants.map((v) => (
                            <option key={v.sku} value={v.sku}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, sku, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, sku, 1)}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {hasItems && (
                  <p className="text-xs text-muted-foreground">
                    Tạm tính:{' '}
                    <span className="font-medium">{formatVND(subtotal)}</span>
                  </p>
                )}
              </div>

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
                        Số điện thoại <span className="text-primary">*</span>
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
                      Tỉnh / Thành phố <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <GeoSelect
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
                        <GeoSelect
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
                      <GeoSelect
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
                      Số nhà, tên đường <span className="text-primary">*</span>
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
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Phương thức thanh toán
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange('COD')}
                          className={cn(
                            'h-9 rounded-lg border text-sm font-medium transition-colors',
                            field.value === 'COD'
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          COD
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('ONLINE')}
                          className={cn(
                            'h-9 rounded-lg border text-sm font-medium transition-colors',
                            field.value === 'ONLINE'
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          Online (QR)
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Prepaid */}
              <FormField
                control={form.control}
                name="isPrepaid"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border h-9 px-3 text-sm font-medium transition-colors',
                          field.value
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        <span>Khách hàng đã thanh toán trước</span>
                        <span
                          className={cn(
                            'flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                            field.value ? 'bg-primary' : 'bg-neutral-300'
                          )}
                        >
                          <span
                            className={cn(
                              'h-4 w-4 rounded-full bg-white shadow transition-transform',
                              field.value ? 'translate-x-4.5' : 'translate-x-0.5'
                            )}
                          />
                        </span>
                      </button>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Shipping payer */}
              <FormField
                control={form.control}
                name="shippingPayer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      Người trả phí vận chuyển
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange('RECEIVER')}
                          className={cn(
                            'h-9 rounded-lg border text-sm font-medium transition-colors',
                            field.value === 'RECEIVER'
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          Người nhận trả
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('SENDER')}
                          className={cn(
                            'h-9 rounded-lg border text-sm font-medium transition-colors',
                            field.value === 'SENDER'
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          Người gửi trả
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={submitting || !hasItems}
                className="w-full h-10"
              >
                {submitting ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
