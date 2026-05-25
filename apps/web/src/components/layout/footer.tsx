import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold text-white text-lg">Mon Ngon Nho Lau</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Đồ ăn nhà làm, mẹ tự tay chế biến từ nguyên liệu tươi sạch. Không chất bảo quản, không phụ gia — chỉ có tình yêu thương và hương vị chân thật.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm">Khám phá</h3>
            <ul className="space-y-3">
              {["Sản phẩm", "Danh mục", "Câu chuyện", "Liên hệ"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:text-orange-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li>monngonnholau.online</li>
              <li>xinchao@monngonnholau.online</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-stone-800" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Mon Ngon Nho Lau. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-orange-400 transition-colors">Chính sách bảo mật</Link>
            <Link href="#" className="hover:text-orange-400 transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
