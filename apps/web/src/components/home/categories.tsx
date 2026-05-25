import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Bơ & Hạt",
    description: "Bơ lạc · Bơ hạt điều · Bơ mè đen",
    count: 3,
    image: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Khô & Sấy",
    description: "Thịt lợn khô · Chuối sấy mộc",
    count: 2,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Nước chấm",
    description: "Nước mắm tự làm",
    count: 1,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Món mặn",
    description: "Thịt chưng mắm tép",
    count: 1,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&auto=format&fit=crop",
  },
];

export function Categories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Danh mục
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tìm theo loại
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="group relative aspect-3/4 rounded-2xl overflow-hidden"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cat.count} sp
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3
                  className="text-white text-xl font-black leading-tight mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {cat.name}
                </h3>
                <p className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
