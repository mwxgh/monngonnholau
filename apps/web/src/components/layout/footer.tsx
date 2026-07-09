import { staticUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Truck } from 'lucide-react'

const navLinks = [
  { href: '#home-section', label: 'Trang chủ' },
  { href: '#about-section', label: 'Về chúng tôi' },
  { href: '#product-section', label: 'Sản phẩm' },
  { href: '#faqs-section', label: 'FAQ' }
]

const FB_URL = `https://www.facebook.com/${process.env.NEXT_PUBLIC_FB_PAGE_ID}`
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? '#'

const socials = [
  {
    href: FB_URL,
    label: 'Facebook',
    path: 'M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z'
  },
  {
    href: TIKTOK_URL,
    label: 'TikTok',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z'
  }
]

export function Footer() {
  return (
    <footer className="pt-16 bg-darkmode">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:gap-20 md:gap-6 sm:gap-12 gap-6 pb-16">
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center text-white text-2xl font-semibold gap-4"
            >
              <Image
                src={staticUrl('images/logo.png')}
                alt="logo"
                width={56}
                height={56}
                style={{ width: 'auto', height: 'auto' }}
              />
              Món Ngon Nhớ Lâu
            </Link>
            <p className="text-xs font-medium text-white/50 mt-5 mb-16 max-w-xs">
              Thực phẩm thủ công, mẹ tự tay làm từng mẻ nhỏ. Không chất bảo
              quản, không phụ gia — chỉ có tình yêu và hương vị chân thật.
            </p>
            <div className="flex gap-6 items-center">
              {socials.map(({ href, label, path }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group bg-white hover:bg-primary rounded-full shadow-xl p-3"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-black group-hover:text-white transition-colors"
                  >
                    <path d={path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white mb-9 font-semibold text-xl">Khám phá</h4>
            <ul>
              {navLinks.map(({ href, label }) => (
                <li key={label} className="pb-5">
                  <Link
                    href={href}
                    className="text-white/70 hover:text-primary text-base transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-9 font-semibold text-xl">Liên hệ</h4>
            <Link
              href="tel:+84869863088"
              className="flex items-center gap-3 text-white/70 hover:text-primary text-base transition-colors mb-5"
            >
              <Phone className="w-5 h-5 shrink-0" />
              0869 863 088
            </Link>
            <div className="flex items-start gap-3 text-white/50 text-sm">
              <Truck className="w-5 h-5 shrink-0" />
              Giao hàng toàn quốc, xác nhận đơn trong 2–4 giờ làm việc.
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 py-10 flex justify-center items-center">
          <p className="text-sm text-white/70">
            © 2025 Món Ngon Nhớ Lâu. Đồ nhà làm — mẹ tự tay chế biến.
          </p>
        </div>
      </div>
    </footer>
  )
}
