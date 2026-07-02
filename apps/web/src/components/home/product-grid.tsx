'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'

interface ProductVariant {
  id: number
  sku: string
  price: string
  thumbnail: string | null
}

interface Product {
  id: number
  slug: string
  name: string
  images: string[]
  variants: ProductVariant[]
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState<number | null>(null)

  function handleAdd(product: Product) {
    const variant = product.variants[0]
    if (!variant) return
    addItem(product.id, variant.sku, 1)
    setJustAdded(product.id)
    setTimeout(
      () => setJustAdded((id) => (id === product.id ? null : id)),
      1200
    )
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 gap-6">
        {products.map((product, index) => {
          const image = product.images[0] ?? product.variants[0]?.thumbnail
          const col = index % 2
          const row = Math.floor(index / 2)
          const isTall = (col + row) % 2 === 0

          return (
            <div
              key={product.id}
              className={`overflow-hidden rounded-3xl mb-6 relative group break-inside-avoid bg-black/5 ${
                isTall ? 'aspect-4/5' : 'aspect-16/10'
              }`}
            >
              {image && (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
              <div className="w-full h-full absolute bg-black/40 top-full group-hover:top-0 duration-500 p-12 flex flex-col items-start gap-8 justify-end">
                <p className="text-white text-2xl">
                  <span className="font-semibold">Tên:</span> {product.name}
                </p>
                <div className="flex items-center justify-between w-full">
                  <p className="text-white text-2xl">
                    <span className="font-semibold">Giá:</span>{' '}
                    {Number(product.variants[0]?.price ?? 0).toLocaleString(
                      'vi-VN'
                    )}
                    đ
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      className="rounded-full"
                      aria-label="Thêm vào giỏ hàng"
                      onClick={() => handleAdd(product)}
                    >
                      {justAdded === product.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </Button>
                    <Button size="pill" render={<Link href="#" />}>
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
