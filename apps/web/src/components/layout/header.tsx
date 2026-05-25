"use client";

import { ShoppingCart, Menu, X, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/products", label: "Sản phẩm" },
  { href: "/categories", label: "Danh mục" },
  { href: "/about", label: "Câu chuyện" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-5 left-0 right-0 z-50 px-4 flex justify-center">
      {/* Floating pill navbar */}
      <header className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100 px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">M</span>
          </div>
          <span className="font-bold text-gray-900 text-sm hidden sm:block">
            Món Ngon Nhỏ Lẩu
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>
          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            Đặt hàng →
          </Link>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-14 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-gray-700 font-medium py-2.5 px-3 rounded-xl hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-1 flex items-center justify-center bg-gray-900 text-white font-semibold text-sm py-2.5 rounded-full"
          >
            Đặt hàng →
          </Link>
        </div>
      )}
    </div>
  );
}
