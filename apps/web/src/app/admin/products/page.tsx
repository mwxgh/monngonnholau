'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { fetchAdmin } from '@/lib/fetch-admin'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X
} from 'lucide-react'
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
import { Img } from '@/components/ui/img'
import { cn } from '@/lib/utils'

interface Variant {
  id: number
  sku: string
  name: string
  price: string
  comparePrice: string | null
  thumbnail: string | null
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
  images: string[]
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

async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetchAdmin(`${API}/api/upload?folder=products`, {
    method: 'POST',
    body: form
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
  return data.url as string
}

// Single-slot image upload — used for a variant thumbnail
function ThumbnailUpload({
  value,
  onChange
}: {
  value: string | null | undefined
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      onChange(await uploadImage(file))
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Tải ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="relative w-10 h-10 shrink-0 rounded-md border border-border overflow-hidden bg-muted/40 flex items-center justify-center hover:border-primary/50 transition-colors disabled:opacity-50"
      title={value ? 'Đổi ảnh' : 'Tải ảnh lên'}
    >
      {uploading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : value ? (
        <Img
          src={value}
          alt=""
          width={40}
          height={40}
          className="object-cover w-full h-full"
        />
      ) : (
        <ImagePlus className="w-4 h-4 text-muted-foreground" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </button>
  )
}

// Fullscreen preview for a gallery of images, with prev/next when there's more than one
function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose
}: {
  images: string[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const open = index !== null
  const count = images.length

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')
        onIndexChange(((index as number) - 1 + count) % count)
      if (e.key === 'ArrowRight') onIndexChange(((index as number) + 1) % count)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, index, count, onIndexChange])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl w-fit border-0 bg-transparent p-0 shadow-none"
      >
        {index !== null && (
          <div className="relative flex items-center justify-center">
            <Img
              src={images[index]}
              alt=""
              width={900}
              height={900}
              className="max-h-[80vh] w-auto h-auto object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
            >
              <X className="w-4 h-4" />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onIndexChange((index - 1 + count) % count)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onIndexChange((index + 1) % count)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/90 bg-black/50 px-2 py-0.5 rounded-full">
                  {index + 1} / {count}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Multi-image gallery — used for product images
function ImageGallery({
  images,
  onChange
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange([...images, url])
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Tải ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((url, i) => (
        <div
          key={url + i}
          className="relative w-16 h-16 rounded-lg border border-border overflow-hidden group"
        >
          <button
            type="button"
            onClick={() => setPreviewIndex(i)}
            className="absolute inset-0"
          >
            <Img
              src={url}
              alt=""
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </button>
          <button
            type="button"
            onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ImagePlus className="w-5 h-5" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <ImageLightbox
        images={images}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState('')
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  async function handleDeleteProduct(product: AdminProduct) {
    if (
      !window.confirm(
        `Xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return
    }
    setDeletingId(product.id)
    try {
      const res = await fetchAdmin(`${API}/api/products/admin/${product.id}`, {
        method: 'DELETE'
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setDeletingId(null)
    }
  }

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

  function addProduct(created: AdminProduct) {
    setProducts((prev) => [created, ...prev])
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
          <div className="flex items-center gap-3">
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
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Button>
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
                            <div className="flex items-center justify-center gap-0.5">
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
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={deletingId === product.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteProduct(product)
                                }}
                              >
                                {deletingId === product.id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                )}
                              </Button>
                            </div>
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
      />

      <ProductCreateDialog
        open={creating}
        categories={categories}
        onClose={() => setCreating(false)}
        onCreated={(created) => {
          addProduct(created)
          setCreating(false)
        }}
      />
    </div>
  )
}

interface VariantEditRow {
  key: string
  id?: number
  sku: string
  name: string
  price: string
  comparePrice: string
  thumbnail: string
  quantity: string
  weight: string
  length: string
  width: string
  height: string
}

function toEditRow(v: Variant): VariantEditRow {
  return {
    key: `existing-${v.id}`,
    id: v.id,
    sku: v.sku,
    name: v.name,
    price: v.price,
    comparePrice: v.comparePrice ?? '',
    thumbnail: v.thumbnail ?? '',
    quantity: String(v.inventory?.quantity ?? 0),
    weight: v.weight != null ? String(v.weight) : '',
    length: v.length != null ? String(v.length) : '',
    width: v.width != null ? String(v.width) : '',
    height: v.height != null ? String(v.height) : ''
  }
}

function emptyEditRow(): VariantEditRow {
  return {
    key: `new-${crypto.randomUUID()}`,
    sku: '',
    name: '',
    price: '',
    comparePrice: '',
    thumbnail: '',
    quantity: '0',
    weight: '',
    length: '',
    width: '',
    height: ''
  }
}

function ProductEditDialog({
  product,
  categories,
  onClose,
  onSaved
}: {
  product: AdminProduct | null
  categories: Category[]
  onClose: () => void
  onSaved: (updated: AdminProduct) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [images, setImages] = useState<string[]>([])
  const [variantRows, setVariantRows] = useState<VariantEditRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!product) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(product.name)
    setDescription(product.description ?? '')
    setCategoryId(product.categoryId ? String(product.categoryId) : '')
    setStatus(product.status)
    setImages(product.images ?? [])
    setVariantRows(product.variants.map(toEditRow))
    setError('')
  }, [product])

  function updateVariantRow(key: string, patch: Partial<VariantEditRow>) {
    setVariantRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )
  }

  function addVariantRow() {
    setVariantRows((prev) => [...prev, emptyEditRow()])
  }

  function removeVariantRow(key: string) {
    setVariantRows((prev) => prev.filter((r) => r.key !== key))
  }

  const variantsValid =
    variantRows.length > 0 &&
    variantRows.every((r) => r.sku.trim() && r.name.trim() && r.price !== '')

  async function handleSave() {
    if (!product) return
    if (!variantsValid) {
      setError(
        'Mỗi biến thể cần có SKU, tên và giá bán. Sản phẩm cần ít nhất 1 biến thể.'
      )
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetchAdmin(`${API}/api/products/admin/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          description,
          categoryId: categoryId ? Number(categoryId) : undefined,
          status,
          images,
          variants: variantRows.map((r) => ({
            id: r.id,
            sku: r.sku,
            name: r.name,
            price: Number(r.price),
            comparePrice: r.comparePrice ? Number(r.comparePrice) : undefined,
            thumbnail: r.thumbnail || undefined,
            quantity: Number(r.quantity || 0),
            weight: r.weight !== '' ? Number(r.weight) : undefined,
            length: r.length !== '' ? Number(r.length) : undefined,
            width: r.width !== '' ? Number(r.width) : undefined,
            height: r.height !== '' ? Number(r.height) : undefined
          }))
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

            <div className="flex flex-col gap-1.5">
              <Label>Ảnh sản phẩm</Label>
              <ImageGallery images={images} onChange={setImages} />
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

          {product && (
            <div className="flex flex-col gap-3 border-t pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Biến thể ({variantRows.length})
                </h3>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Thêm biến thể
                </button>
              </div>
              {variantRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Chưa có biến thể nào.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-muted-foreground">
                        <th className="w-12" />
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
                      {variantRows.map((row) => (
                        <VariantEditRowFields
                          key={row.key}
                          row={row}
                          onChange={(patch) => updateVariantRow(row.key, patch)}
                          onRemove={() => removeVariantRow(row.key)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

interface VariantGroup {
  id: string
  name: string
  options: string[]
}

interface VariantRowData {
  sku: string
  price: string
  quantity: string
  thumbnail: string
}

function ProductCreateDialog({
  open,
  categories,
  onClose,
  onCreated
}: {
  open: boolean
  categories: Category[]
  onClose: () => void
  onCreated: (created: AdminProduct) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [images, setImages] = useState<string[]>([])

  // Simple mode (no variant groups) — single default variant
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [thumbnail, setThumbnail] = useState('')

  // Grouped mode — Shopee-style attribute groups × generated variants
  const [groups, setGroups] = useState<VariantGroup[]>([])
  const [rows, setRows] = useState<Record<string, VariantRowData>>({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setName('')
    setDescription('')
    setCategoryId('')
    setStatus('ACTIVE')
    setImages([])
    setSku('')
    setPrice('')
    setQuantity('0')
    setThumbnail('')
    setGroups([])
    setRows({})
    setError('')
  }

  const validGroups = groups
    .map((g) => ({
      ...g,
      options: g.options.map((o) => o.trim()).filter(Boolean)
    }))
    .filter((g) => g.name.trim() && g.options.length > 0)

  const combos = validGroups.reduce<Record<string, string>[]>((acc, group) => {
    if (acc.length === 0) {
      return group.options.map((opt) => ({ [group.name]: opt }))
    }
    return acc.flatMap((combo) =>
      group.options.map((opt) => ({ ...combo, [group.name]: opt }))
    )
  }, [])

  function comboKey(combo: Record<string, string>) {
    return validGroups.map((g) => combo[g.name]).join(' :: ')
  }

  function getRow(key: string): VariantRowData {
    return rows[key] ?? { sku: '', price: '', quantity: '0', thumbnail: '' }
  }

  function updateRow(key: string, patch: Partial<VariantRowData>) {
    setRows((prev) => ({ ...prev, [key]: { ...getRow(key), ...patch } }))
  }

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', options: [''] }
    ])
  }

  function removeGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  function updateGroupName(id: string, value: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: value } : g))
    )
  }

  function addOption(id: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, options: [...g.options, ''] } : g))
    )
  }

  function updateOption(id: string, index: number, value: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== id
          ? g
          : {
              ...g,
              options: g.options.map((o, i) => (i === index ? value : o))
            }
      )
    )
  }

  function removeOption(id: string, index: number) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== id
          ? g
          : { ...g, options: g.options.filter((_, i) => i !== index) }
      )
    )
  }

  async function handleCreate() {
    setSaving(true)
    setError('')
    try {
      const variants =
        combos.length > 0
          ? combos.map((combo) => {
              const row = getRow(comboKey(combo))
              return {
                sku: row.sku,
                name: Object.values(combo).join(' - '),
                price: Number(row.price),
                quantity: Number(row.quantity || 0),
                thumbnail: row.thumbnail || undefined,
                attributes: combo
              }
            })
          : [
              {
                sku,
                name,
                price: Number(price),
                quantity: Number(quantity || 0),
                thumbnail: thumbnail || undefined
              }
            ]

      const res = await fetchAdmin(`${API}/api/products/admin`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          status,
          images,
          variants
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      onCreated(data as AdminProduct)
      reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const canSubmit =
    !!name.trim() &&
    (combos.length > 0
      ? combos.every((combo) => {
          const row = getRow(comboKey(combo))
          return row.sku.trim() && row.price !== ''
        })
      : !!sku.trim() && price !== '')

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <Label>Ảnh sản phẩm</Label>
            <ImageGallery images={images} onChange={setImages} />
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

          <div className="flex flex-col gap-3 border-t pt-4">
            <h3 className="text-sm font-semibold text-foreground">Biến thể</h3>

            {groups.length === 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-3">
                  <ThumbnailUpload value={thumbnail} onChange={setThumbnail} />
                  <p className="text-xs text-muted-foreground">
                    Ảnh biến thể (tùy chọn)
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>SKU</Label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Giá bán</Label>
                  <Input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Tồn kho ban đầu</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-lg border border-border p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={group.name}
                        onChange={(e) =>
                          updateGroupName(group.id, e.target.value)
                        }
                        placeholder="Tên nhóm (VD: Vị, Kích cỡ)"
                        className="h-8 text-sm font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeGroup(group.id)}
                        title="Xóa nhóm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-1">
                      {group.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={opt}
                            onChange={(e) =>
                              updateOption(group.id, i, e.target.value)
                            }
                            placeholder="Giá trị (VD: Origin, 200g)"
                            className="h-8 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeOption(group.id, i)}
                            disabled={group.options.length <= 1}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(group.id)}
                        className="self-start text-xs font-medium text-primary hover:underline"
                      >
                        + Thêm lựa chọn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addGroup}
              className="self-start text-xs font-medium text-primary hover:underline"
            >
              + Thêm nhóm biến thể
            </button>

            {combos.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  Danh sách biến thể ({combos.length})
                </h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-muted-foreground">
                        <th className="w-12" />
                        {validGroups.map((g) => (
                          <th
                            key={g.name}
                            className="text-left py-2 px-3 font-medium"
                          >
                            {g.name}
                          </th>
                        ))}
                        <th className="text-left py-2 px-3 font-medium w-28">
                          SKU
                        </th>
                        <th className="text-left py-2 px-3 font-medium w-24">
                          Giá bán
                        </th>
                        <th className="text-left py-2 px-3 font-medium w-20">
                          Tồn kho
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {combos.map((combo) => {
                        const key = comboKey(combo)
                        const row = getRow(key)
                        return (
                          <tr key={key} className="border-b last:border-0">
                            <td className="p-1.5">
                              <ThumbnailUpload
                                value={row.thumbnail}
                                onChange={(url) =>
                                  updateRow(key, { thumbnail: url })
                                }
                              />
                            </td>
                            {validGroups.map((g) => (
                              <td key={g.name} className="py-1.5 px-3 text-xs">
                                {combo[g.name]}
                              </td>
                            ))}
                            <td className="p-1.5">
                              <Input
                                value={row.sku}
                                onChange={(e) =>
                                  updateRow(key, { sku: e.target.value })
                                }
                                className="h-8 text-xs font-mono"
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                type="number"
                                min={0}
                                value={row.price}
                                onChange={(e) =>
                                  updateRow(key, { price: e.target.value })
                                }
                                className="h-8 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                type="number"
                                min={0}
                                value={row.quantity}
                                onChange={(e) =>
                                  updateRow(key, { quantity: e.target.value })
                                }
                                className="h-8 text-xs"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                reset()
                onClose()
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={saving || !canSubmit}>
              {saving ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VariantEditRowFields({
  row,
  onChange,
  onRemove
}: {
  row: VariantEditRow
  onChange: (patch: Partial<VariantEditRow>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="p-2">
          <ThumbnailUpload
            value={row.thumbnail}
            onChange={(url) => onChange({ thumbnail: url })}
          />
        </td>
        <td className="p-2">
          <Input
            value={row.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            className="h-9 text-sm font-mono"
          />
        </td>
        <td className="p-2">
          <Input
            value={row.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={row.price}
            onChange={(e) => onChange({ price: e.target.value })}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={row.comparePrice}
            onChange={(e) => onChange({ comparePrice: e.target.value })}
            className="h-9 text-sm"
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min={0}
            value={row.quantity}
            onChange={(e) => onChange({ quantity: e.target.value })}
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
              onClick={onRemove}
              title="Xóa biến thể"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border last:border-0 bg-muted/20">
          <td colSpan={7} className="p-2">
            <div className="grid grid-cols-4 gap-3 px-1">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  Khối lượng (g)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={row.weight}
                  onChange={(e) => onChange({ weight: e.target.value })}
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
                  value={row.length}
                  onChange={(e) => onChange({ length: e.target.value })}
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
                  value={row.width}
                  onChange={(e) => onChange({ width: e.target.value })}
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
                  value={row.height}
                  onChange={(e) => onChange({ height: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
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
