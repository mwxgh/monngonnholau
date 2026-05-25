import { Search, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Chọn sản phẩm",
    description: "Duyệt danh sách sản phẩm thủ công, đọc mô tả nguyên liệu và chọn những gì bạn muốn.",
  },
  {
    step: "02",
    icon: ShoppingBag,
    title: "Đặt hàng dễ dàng",
    description: "Thêm vào giỏ, điền địa chỉ giao hàng và thanh toán an toàn chỉ vài bước đơn giản.",
  },
  {
    step: "03",
    icon: Truck,
    title: "Nhận hàng tận nơi",
    description: "Đóng gói cẩn thận, giao tận tay trong vòng 1–2 ngày.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Cách đặt hàng
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black text-gray-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Chỉ 3 bước đơn giản
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Mua ngay →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-4xl font-black text-gray-100" style={{ fontFamily: "var(--font-display)" }}>
                  {step}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
