import { ProductGrid } from './product-grid'

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

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    next: { revalidate: 60 }
  })
  if (!res.ok) return []
  return res.json()
}

export async function FeaturedProducts() {
  const products = (await getProducts()).slice(0, 4)

  return (
    <section id="product-section">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
            Sản phẩm nổi bật
          </p>
          <h2 className="text-3xl lg:text-5xl font-semibold text-black">
            Những món ăn do chúng tôi chế biến.
          </h2>
        </div>
        <div className="my-16 px-6">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  )
}
