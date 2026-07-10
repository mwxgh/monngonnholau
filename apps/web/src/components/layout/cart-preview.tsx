'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { useCart } from '@/lib/cart-context'

interface ProductVariant {
  sku: string
  price: string
  thumbnail: string | null
}

interface Product {
  id: number
  name: string
  images: string[]
  variants: ProductVariant[]
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export function CartPreview({ onOpenCart }: { onOpenCart: () => void }) {
  const { items, itemCount, removeItem } = useCart()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)

  function loadProducts() {
    if (products || loading) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data)
        // Dọn các sku không còn tồn tại (vd. sản phẩm đã bị xoá/reset dữ liệu)
        // khỏi giỏ đã lưu, tránh lệch số lượng hiển thị trên badge.
        const validSkus = new Set(
          data.flatMap((p) => p.variants.map((v) => v.sku))
        )
        items.forEach((item) => {
          if (!validSkus.has(item.sku)) removeItem(item.sku)
        })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  const cartItems = items.flatMap((item) => {
    const product = (products ?? []).find((p) =>
      p.variants.some((v) => v.sku === item.sku)
    )
    const variant = product?.variants.find((v) => v.sku === item.sku)
    if (!product || !variant) return []
    return [
      {
        sku: item.sku,
        qty: item.qty,
        name: product.name,
        price: Number(variant.price),
        thumbnail: variant.thumbnail ?? product.images[0] ?? null
      }
    ]
  })

  return (
    <HoverCard onOpenChange={(open) => open && loadProducts()}>
      <HoverCardTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full"
            onClick={onOpenCart}
            aria-label="Giỏ hàng"
          />
        }
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
            {itemCount}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent sideOffset={24}>
        <p className="mb-3 text-sm font-semibold">Sản phẩm mới thêm</p>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cartItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Giỏ hàng của bạn đang trống.
          </p>
        ) : (
          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {cartItems.map((item) => (
              <li key={item.sku} className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatVND(item.price)} × {item.qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button size="pill" className="mt-4 w-full" onClick={onOpenCart}>
          Xem giỏ hàng
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}
