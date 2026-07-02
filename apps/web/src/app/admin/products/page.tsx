'use client'

import { Fragment, useEffect, useState } from 'react'
import { fetchAdmin } from '@/lib/fetch-admin'
import { ChevronDown, ChevronRight, Pencil, Save } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Variant {
  id: number
  sku: string
  name: string
  price: string
  comparePrice: string | null
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  inventory: { quantity: number } | null
}

interface Category {
  id: number
  name: string
}

interface AdminProduct {
  id: number
  name: string
  slug: string
  description: string | null
  status: string
  categoryId: number | null
  category: { name: string } | null
  variants: Variant[]
  createdAt: string
}

function formatVND(n: number) {
  return '₫' + n.toLocaleString('vi-VN')
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Đang bán',
    className: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
  },
  INACTIVE: {
    label: 'Tạm dừng',
    className: 'text-gray-600 bg-gray-50 border border-gray-200'
  },
  DRAFT: {
    label: 'Nháp',
    className: 'text-amber-700 bg-amber-50 border border-amber-200'
  }
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState('')
  const [editingProductId, setEditingProductId] = useState<number | null>(null)

  useEffect(() => {
    fetchAdmin(`${API}/api/products/admin`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`)
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function applyProductUpdate(updated: AdminProduct) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    )
  }

  function applyVariantUpdate(productId: number, updated: Variant) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.id === updated.id ? updated : v
              )
            }
      )
    )
  }

  const filtered = filter
    ? products.filter((p) => p.status === filter)
    : products

  const totalStock = (product: AdminProduct) =>
    product.variants.reduce((s, v) => s + (v.inventory?.quantity ?? 0), 0)

  const priceRange = (product: AdminProduct) => {
    const prices = product.variants.map((v) => Number(v.price))
    if (prices.length === 0) return '—'
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max
      ? formatVND(min)
      : `${formatVND(min)} – ${formatVND(max)}`
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Quản lý sản phẩm và tồn kho.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>{products.length} sản phẩm</CardDescription>
          </div>
          <div className="flex gap-1.5">
            {['', 'ACTIVE', 'INACTIVE', 'DRAFT'].map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filter === value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {value === '' ? 'Tất cả' : STATUS_META[value]?.label}
                <span className="ml-1 font-normal">
                  (
                  {value === ''
                    ? products.length
                    : products.filter((p) => p.status === value).length}
                  )
                </span>
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
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="w-6 text-left pb-3 font-medium" />
                    <th className="w-[28%] text-left pb-3 font-medium">
                      Sản phẩm
                    </th>
                    <th className="w-[14%] text-left pb-3 font-medium">
                      Danh mục
                    </th>
                    <th className="w-[8%] text-center pb-3 font-medium">
                      Biến thể
                    </th>
                    <th className="w-[16%] text-left pb-3 font-medium">Giá</th>
                    <th className="w-[10%] text-center pb-3 font-medium">
                      Tồn kho
                    </th>
                    <th className="w-[12%] text-center pb-3 font-medium">
                      Trạng thái
                    </th>
                    <th className="w-[12%] text-center pb-3 font-medium">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const isExpanded = expanded.has(product.id)
                    const stock = totalStock(product)
                    const s = STATUS_META[product.status] ?? {
                      label: product.status,
                      className: ''
                    }
                    return (
                      <Fragment key={product.id}>
                        <tr
                          onClick={() => toggleExpand(product.id)}
                          className="border-b hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 pl-1 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </td>
                          <td className="py-3">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              {product.slug}
                            </p>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground truncate">
                            {product.category?.name ?? '—'}
                          </td>
                          <td className="py-3 text-center text-sm">
                            {product.variants.length}
                          </td>
                          <td className="py-3 text-sm">
                            {priceRange(product)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                stock === 0
                                  ? 'text-red-600'
                                  : stock <= 10
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                              )}
                            >
                              {stock}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}
                            >
                              {s.label}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingProductId(product.id)
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>

                        {/* Expanded variants */}
                        {isExpanded &&
                          product.variants.map((v) => (
                            <tr key={v.id} className="bg-muted/20 border-b">
                              <td />
                              <td className="py-2 pl-6 text-xs text-muted-foreground font-mono truncate">
                                {v.sku}
                              </td>
                              <td className="py-2 text-xs text-muted-foreground truncate">
                                {v.name}
                              </td>
                              <td />
                              <td className="py-2 text-xs">
                                <span className="font-medium">
                                  {formatVND(Number(v.price))}
                                </span>
                                {v.comparePrice && (
                                  <span className="ml-1.5 line-through text-muted-foreground">
                                    {formatVND(Number(v.comparePrice))}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-center">
                                <VariantQuantityInput
                                  productId={product.id}
                                  variant={v}
                                  onSaved={applyVariantUpdate}
                                />
                              </td>
                              <td />
                              <td />
                            </tr>
                          ))}
                      </Fragment>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductEditDialog
        product={products.find((p) => p.id === editingProductId) ?? null}
        categories={categories}
        onClose={() => setEditingProductId(null)}
        onSaved={(updated) => {
          applyProductUpdate(updated)
          setEditingProductId(null)
        }}
        onVariantSaved={applyVariantUpdate}
      />
    </div>
  )
}

function ProductEditDialog({
  product,
  categories,
  onClose,
  onSaved,
  onVariantSaved
}: {
  product: AdminProduct | null
  categories: Category[]
  onClose: () => void
  onSaved: (updated: AdminProduct) => void
  onVariantSaved: (productId: number, updated: Variant) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!product) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(product.name)
    setDescription(product.description ?? '')
    setCategoryId(product.categoryId ? String(product.categoryId) : '')
    setStatus(product.status)
    setError('')
  }, [product])

  async function handleSave() {
    if (!product) return
    setSaving(true)
    setError('')
    try {
      const res = await fetchAdmin(`${API}/api/products/admin/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          description,
          categoryId: categoryId ? Number(categoryId) : undefined,
          status
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      onSaved(data as AdminProduct)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              Thông tin chung
            </h3>

            <div className="flex flex-col gap-1.5">
              <Label>Tên sản phẩm</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Mô tả</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Danh mục</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Trạng thái</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {product && product.variants.length > 0 && (
            <div className="flex flex-col gap-3 border-t pt-5">
              <h3 className="text-sm font-semibold text-foreground">
                Biến thể ({product.variants.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-muted-foreground">
                      <th className="text-left py-2.5 px-3 font-medium w-32">
                        SKU
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium">
                        Tên biến thể
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium w-28">
                        Giá bán
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium w-28">
                        Giá gốc
                      </th>
                      <th className="text-center py-2.5 px-3 font-medium w-20">
                        Tồn kho
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <VariantInlineEditor
                        key={v.id}
                        productId={product.id}
                        variant={v}
                        onSaved={onVariantSaved}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-5">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VariantInlineEditor({
  productId,
  variant,
  onSaved
}: {
  productId: number
  variant: Variant
  onSaved: (productId: number, updated: Variant) => void
}) {
  const [sku, setSku] = useState(variant.sku)
  const [name, setName] = useState(variant.name)
  const [price, setPrice] = useState(variant.price)
  const [comparePrice, setComparePrice] = useState(variant.comparePrice ?? '')
  const [quantity, setQuantity] = useState(
    String(variant.inventory?.quantity ?? 0)
  )
  const [weight, setWeight] = useState(variant.weight ?? '')
  const [length, setLength] = useState(variant.length ?? '')
  const [width, setWidth] = useState(variant.width ?? '')
  const [height, setHeight] = useState(variant.height ?? '')
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetchAdmin(
        `${API}/api/products/admin/variants/${variant.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            sku,
            name,
            price: Number(price),
            comparePrice: comparePrice ? Number(comparePrice) : undefined,
            quantity: Number(quantity),
            weight: weight !== '' ? Number(weight) : undefined,
            length: length !== '' ? Number(length) : undefined,
            width: width !== '' ? Number(width) : undefined,
            height: height !== '' ? Number(height) : undefined
          })
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      onSaved(productId, data as Variant)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="p-2">
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="h-9 text-sm font-mono"
          />
        </td>
        <td className="p-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-9 text-sm text-center"
          />
        </td>
        <td className="p-2 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              title="Kích thước & khối lượng"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              disabled={saving}
              title="Lưu biến thể"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border last:border-0 bg-muted/20">
          <td colSpan={6} className="p-2">
            <div className="grid grid-cols-4 gap-3 px-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Khối lượng (g)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Dài (cm)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Rộng (cm)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Cao (cm)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
      {error && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={6} className="px-3 pb-2 text-sm text-red-500">
            {error}
          </td>
        </tr>
      )}
    </>
  )
}

function VariantQuantityInput({
  productId,
  variant,
  onSaved
}: {
  productId: number
  variant: Variant
  onSaved: (productId: number, updated: Variant) => void
}) {
  const savedQuantity = variant.inventory?.quantity ?? 0
  const [value, setValue] = useState(String(savedQuantity))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(String(savedQuantity))
  }, [savedQuantity])

  async function commit() {
    const quantity = Math.max(0, Math.trunc(Number(value)) || 0)
    if (quantity === savedQuantity) {
      setValue(String(quantity))
      return
    }
    setSaving(true)
    try {
      const res = await fetchAdmin(
        `${API}/api/products/admin/variants/${variant.id}`,
        { method: 'PATCH', body: JSON.stringify({ quantity }) }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      onSaved(productId, data as Variant)
    } catch {
      setValue(String(savedQuantity))
    } finally {
      setSaving(false)
    }
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      className={cn(
        'w-16 rounded border border-input bg-transparent px-1.5 py-0.5 text-center text-xs font-semibold outline-none focus:ring-1 focus:ring-ring disabled:opacity-50',
        savedQuantity === 0
          ? 'text-red-600'
          : savedQuantity <= 5
            ? 'text-amber-600'
            : 'text-emerald-600'
      )}
    />
  )
}
