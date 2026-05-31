"use client";

import { staticUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

const navLinks = [
  { href: "#home-section", label: "Trang chủ" },
  { href: "#about-section", label: "Về chúng tôi" },
  { href: "#cook-section", label: "Công thức" },
  { href: "#gallery-section", label: "Thư viện" },
];

export function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navbarOpen]);

  useEffect(() => {
    document.body.style.overflow = navbarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navbarOpen]);

  return (
    <header
      className={`fixed top-0 z-40 w-full bg-white py-1 transition-all duration-300 ${
        sticky ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="lg:py-0 py-2">
        <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={staticUrl("images/logo.png")}
              alt="Món Ngon Nhớ Lâu"
              width={200}
              height={64}
              priority
              style={{ height: "4rem", width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex grow items-center gap-8 justify-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base font-medium hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="tel:+84869863088"
              className="text-lg font-medium hover:text-primary flex items-center gap-2"
            >
              <Phone className="text-primary w-6 h-6 inline-block mr-1" />
              0869 863 088
            </Link>
            <Link href="#cook-section" className="hidden lg:inline-flex btn-outline">
              Xem thực đơn
            </Link>
            <Link
              href="#gallery-section"
              className="hidden lg:inline-flex btn-primary"
            >
              Đặt hàng
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="block lg:hidden p-2 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800 mt-1.5"></span>
            <span className="block w-6 h-0.5 bg-gray-800 mt-1.5"></span>
          </button>
        </div>

        {/* Mobile overlay */}
        {navbarOpen && <div className="fixed inset-0 bg-black/50 z-40" />}

        {/* Mobile drawer */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs z-50 ${
            navbarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center">
              <Image
                src={staticUrl("images/logo.png")}
                alt="Món Ngon Nhớ Lâu"
                width={40}
                height={40}
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <button
              onClick={() => setNavbarOpen(false)}
              className="absolute top-0 right-0 mr-8 mt-8"
              aria-label="Close menu"
            >
              <Image
                src={staticUrl("images/closed.svg")}
                alt="close"
                width={20}
                height={20}
                className="invert"
                style={{ width: "auto", height: "auto" }}
              />
            </button>
          </div>
          <nav className="flex flex-col items-start p-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setNavbarOpen(false)}
                className="text-base font-medium text-white/80 hover:text-primary py-2.5 px-3 w-full transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 w-full">
              <Link
                href="#cook-section"
                onClick={() => setNavbarOpen(false)}
                className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white text-center"
              >
                Xem thực đơn
              </Link>
              <Link
                href="#gallery-section"
                onClick={() => setNavbarOpen(false)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 text-center"
              >
                Đặt hàng
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
