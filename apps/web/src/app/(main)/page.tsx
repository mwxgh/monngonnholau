import { Hero } from '@/components/home/hero'
import { About } from '@/components/home/about'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Newsletter } from '@/components/home/newsletter'
import { Faqs } from '@/components/home/faqs'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProducts />
      <Faqs />
      <Newsletter />
    </>
  )
}
