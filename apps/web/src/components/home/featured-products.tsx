import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Leaf } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Bơ Lạc Thủ Công",
    description: "Rang mộc 100% lạc ta, không đường, không dầu thực vật.",
    price: 85000,
    weight: "250g",
    image: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=600&q=80&auto=format&fit=crop",
    tag: "Bán chạy",
  },
  {
    id: 2,
    name: "Bơ Hạt Điều",
    description: "Hạt điều rang vàng, mịn mượt, béo ngậy tự nhiên.",
    price: 120000,
    weight: "250g",
    image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&q=80&auto=format&fit=crop",
    tag: "Yêu thích",
  },
  {
    id: 3,
    name: "Thịt Lợn Khô",
    description: "Thịt nạc thăn sấy khô, ướp gia vị gia truyền.",
    price: 180000,
    weight: "100g",
    image: "https://images.unsplash.com/photo-1621478374422-35206faeddfb?w=600&q=80&auto=format&fit=crop",
    tag: null,
  },
  {
    id: 4,
    name: "Chuối Sấy Mộc",
    description: "Chuối tiêu sấy khô tự nhiên, không đường, không phụ gia.",
    price: 55000,
    weight: "200g",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80&auto=format&fit=crop",
    tag: "Mới",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Nổi bật
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Được yêu thích nhất
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {p.tag}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.weight}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                    <Leaf className="w-3 h-3" /> Tự nhiên
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-4">
                  {p.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-gray-900">{fmt(p.price)}</span>
                  <button className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-orange-500 text-gray-600 hover:text-white flex items-center justify-center transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
