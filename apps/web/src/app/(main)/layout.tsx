import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FloatingButtons } from '@/components/layout/floating-buttons'
import { CartProvider } from '@/lib/cart-context'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </CartProvider>
  )
}
