"use client";

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
    return () => { document.body.style.overflow = ""; };
  }, [navbarOpen]);

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        sticky ? "shadow-lg bg-white py-4" : "shadow-none py-8"
      }`}
    >
      <div className="lg:py-0 py-2">
        <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-black text-2xl font-semibold gap-4"
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
              href="tel:+84900000000"
              className="text-lg font-medium hover:text-primary flex items-center gap-2"
            >
              <Phone className="text-primary w-6 h-6 inline-block mr-1" />
              0900 000 000
            </Link>
            <Link
              href="#cook-section"
              className="hidden lg:block text-primary bg-primary/15 hover:text-white hover:bg-primary font-medium text-lg py-4 px-8 rounded-full"
            >
              Xem thực đơn
            </Link>
            <Link
              href="#gallery-section"
              className="hidden lg:block bg-primary text-white hover:bg-primary/15 hover:text-primary font-medium text-lg py-4 px-8 rounded-full"
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
        {navbarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" />
        )}

        {/* Mobile drawer */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs z-50 ${
            navbarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center text-white text-xl font-semibold gap-3"
            >
              <Image
                src="/images/logo/Logo.svg"
                alt="logo"
                width={40}
                height={40}
              />
              Mon Ngon Nho Lau
            </Link>
            <button
              onClick={() => setNavbarOpen(false)}
              className="absolute top-0 right-0 mr-8 mt-8"
              aria-label="Close menu"
            >
              <Image
                src="/images/closed.svg"
                alt="close"
                width={20}
                height={20}
                className="invert"
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
