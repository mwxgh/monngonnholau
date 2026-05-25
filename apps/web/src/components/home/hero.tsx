import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Header } from "@/components/layout/header";

const avatars = ["A", "B", "C", "D", "E"];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-16 sm:pb-24">
      {/* Background image — woman cooking at home */}
      <Image
        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&q=85&auto=format&fit=crop"
        alt="Mẹ nấu ăn tại nhà"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />

      {/* Dark olive/forest overlay — same feel as reference */}
      <div className="absolute inset-0 bg-linear-to-br from-stone-900/80 via-stone-800/60 to-stone-900/40" />

      {/* Floating navbar sits on top */}
      <Header />

      {/* Hero content — bottom-left aligned */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <h1
          className="text-[clamp(3.5rem,9vw,7.5rem)] font-black text-white leading-[0.9] mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nấu Tại Nhà.
          <br />
          Trao Tình Thương.
          <br />
          Giao Đến Bạn.
        </h1>

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
          Thực phẩm thủ công, không chất bảo quản. Từng mẻ nhỏ được làm tỉ mỉ
          như nấu cho gia đình.
        </p>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full transition-colors text-base"
        >
          Xem sản phẩm →
        </Link>

        {/* Social proof */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex -space-x-2">
            {avatars.map((l) => (
              <div
                key={l}
                className="w-8 h-8 rounded-full border-2 border-white bg-orange-200 flex items-center justify-center text-orange-700 text-[10px] font-bold"
              >
                {l}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-0.5">200+ khách hàng hài lòng</p>
          </div>
        </div>
      </div>
    </section>
  );
}
