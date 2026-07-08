import { staticUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section
      id="home-section"
      className="relative min-h-screen flex items-center"
    >
      <Image
        src={staticUrl('images/banner.jpg')}
        alt="banner"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl lg:text-7xl font-semibold mb-5 text-white">
            Món Ngon Nhớ Lâu - Đòn Đau ...
          </h1>
          <p className="text-white/80 lg:text-lg font-normal mb-10">
            Thực phẩm thủ công, không chất bảo quản. Từng mẻ nhỏ được làm tỉ mỉ
            như nấu cho chính gia đình bạn.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="pill" render={<Link href="#product-section" />}>
              Khám phá ngay
            </Button>
            <Button
              variant="outline"
              size="pill"
              render={<Link href="#about-section" />}
              className="bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              Về chúng tôi
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
