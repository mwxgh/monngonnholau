import Image from "next/image";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl grid lg:grid-cols-2 min-h-80 bg-gray-900">
          {/* Left */}
          <div className="relative z-10 p-10 lg:p-14 flex flex-col justify-between">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              Cam kết của chúng tôi
            </p>
            <div>
              <h2
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Làm ít,<br />
                làm kỹ,<br />
                làm bằng tâm.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                Không vội vã, không đại trà. Chỉ những mẻ nhỏ — đủ chăm chút, đủ yêu thương.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-lg transition-colors text-sm"
              >
                Mua ngay →
              </Link>
            </div>
          </div>

          {/* Right image */}
          <div className="relative hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=85&auto=format&fit=crop"
              alt="Nguyên liệu tươi sạch"
              fill
              sizes="50vw"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-gray-900/30 to-transparent" />

            <div className="absolute bottom-10 right-8 flex flex-col gap-3">
              {[
                { val: "0%", text: "Chất bảo quản" },
                { val: "100%", text: "Tự nhiên" },
                { val: "♡", text: "Mẹ tự tay làm" },
              ].map(({ val, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5"
                >
                  <span className="text-orange-400 font-black text-base w-12 text-center">
                    {val}
                  </span>
                  <span className="text-white/70 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
