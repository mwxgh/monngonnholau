import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "#home-section", label: "Trang chủ" },
  { href: "#about-section", label: "Về chúng tôi" },
  { href: "#cook-section", label: "Công thức" },
  { href: "#gallery-section", label: "Thư viện" },
];

const companyLinks = ["Giới thiệu", "Tuyển dụng", "Di động", "Blog", "Cách chúng tôi làm việc"];
const infoLinks = ["FAQ", "Báo chí", "Đối tác", "Nhà hàng", "Cộng tác viên"];

const socials = [
  {
    href: "#",
    label: "Facebook",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    href: "#",
    label: "Instagram",
    path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z",
  },
  {
    href: "#",
    label: "X / Twitter",
    path: "M4 4l16 16M4 20 20 4",
  },
];

export function Footer() {
  return (
    <footer className="pt-16 bg-darkmode">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 lg:gap-20 md:gap-6 sm:gap-12 gap-6 pb-16">
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center text-white text-2xl font-semibold gap-4"
            >
              <Image
                src="/images/logo/Logo.svg"
                alt="logo"
                width={56}
                height={56}
                style={{ width: "auto", height: "auto" }}
              />
              Mon Ngon Nho Lau
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
                  aria-label={label}
                  className="group bg-white hover:bg-primary rounded-full shadow-xl p-3"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-black group-hover:text-white transition-colors"
                  >
                    <path d={path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white mb-9 font-semibold text-xl">Công ty</h4>
            <ul>
              {companyLinks.map((item) => (
                <li key={item} className="pb-5">
                  <Link
                    href="#"
                    className="text-white/70 hover:text-primary text-base transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-9 font-semibold text-xl">Thông tin</h4>
            <ul>
              {infoLinks.map((item) => (
                <li key={item} className="pb-5">
                  <Link
                    href="#"
                    className="text-white/70 hover:text-primary text-base transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-9 font-semibold text-xl">Khác</h4>
            <ul>
              {navLinks.map(({ href, label }) => (
                <li key={label} className="pb-4">
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
        </div>

        <div className="border-t border-white/15 py-10 flex justify-between items-center">
          <p className="text-sm text-white/70">
            © 2025 Mon Ngon Nho Lau. Đồ nhà làm — mẹ tự tay chế biến.
          </p>
          <div>
            <Link
              href="#"
              className="text-sm text-white/70 px-5 border-r border-white/15 hover:text-primary transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              className="text-sm text-white/70 px-5 hover:text-primary transition-colors"
            >
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
