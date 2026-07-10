'use client'

import { staticUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  Menu,
  Phone,
  ShoppingCart,
  ClipboardList,
  User,
  UserPlus,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react'
import { LoginModal } from '@/components/auth/login-modal'
import { OrderModal } from '@/components/order/order-modal'
import { CartPreview } from '@/components/layout/cart-preview'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useCart } from '@/lib/cart-context'

const navLinks = [
  { href: '#home-section', label: 'Trang chủ' },
  { href: '#about-section', label: 'Về chúng tôi' },
  { href: '#product-section', label: 'Sản phẩm' },
  { href: '#faqs-section', label: 'FAQ' }
]

export function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isStaff, setIsStaff] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderView, setOrderView] = useState<'browse' | 'cart'>('browse')
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { itemCount } = useCart()

  // Nhân viên/quản trị đặt hàng qua kênh nội bộ, không dùng giỏ hàng khách
  const canOrder = !isAdmin && !isStaff

  function openOrder(view: 'browse' | 'cart') {
    setOrderView(view)
    setOrderOpen(true)
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true)
      setIsAdmin(payload.role === 'ADMIN')
      setIsStaff(payload.role === 'STAFF')
    } catch {
      localStorage.removeItem('access_token')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [navbarOpen])

  useEffect(() => {
    document.body.style.overflow = navbarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navbarOpen])

  return (
    <header
      className={`fixed top-0 z-40 w-full bg-white py-1 transition-all duration-300 ${
        sticky ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className="lg:py-0 py-2">
        <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={staticUrl('images/logo.png')}
              alt="Món Ngon Nhớ Lâu"
              width={200}
              height={64}
              priority
              style={{ height: '4rem', width: 'auto' }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex grow items-center gap-8 justify-center">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-base font-medium hover:text-primary transition-colors"
              >
                {label}
              </a>
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
            {canOrder && (
              <>
                <CartPreview onOpenCart={() => openOrder('cart')} />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        aria-label="Đặt hàng"
                        onClick={() => openOrder('browse')}
                      />
                    }
                  >
                    <ClipboardList className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent sideOffset={24}>Đặt hàng</TooltipContent>
                </Tooltip>
              </>
            )}
            {isLoggedIn ? (
              <div className="relative group">
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                  <div className="w-48 bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-none text-primary hover:text-primary"
                        render={<Link href="/admin" />}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Quản trị hệ thống
                      </Button>
                    )}
                    {!isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-none"
                        render={<Link href="/account" />}
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        Tài khoản của tôi
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-none text-destructive hover:text-destructive"
                      onClick={() => {
                        localStorage.removeItem('access_token')
                        setIsLoggedIn(false)
                        setIsAdmin(false)
                        setIsStaff(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      aria-label="Đăng nhập"
                      onClick={() => setLoginOpen(true)}
                    />
                  }
                >
                  <UserPlus className="w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent sideOffset={24}>
                  Đăng nhập / Đăng ký
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-1 lg:hidden">
            {canOrder && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => openOrder('cart')}
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavbarOpen(!navbarOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile overlay */}
        {navbarOpen && <div className="fixed inset-0 bg-black/50 z-40" />}

        {/* Mobile drawer */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs z-50 ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center">
              <Image
                src={staticUrl('images/logo.png')}
                alt="Món Ngon Nhớ Lâu"
                width={40}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNavbarOpen(false)}
              className="text-white hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex flex-col items-start p-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setNavbarOpen(false)}
                className="text-base font-medium text-white/80 hover:text-primary py-2.5 px-3 w-full transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 w-full">
              {canOrder && (
                <Button
                  size="pill"
                  className="w-full"
                  onClick={() => {
                    setNavbarOpen(false)
                    openOrder('browse')
                  }}
                >
                  Đặt hàng
                </Button>
              )}
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="pill"
                      className="w-full gap-2 border-primary text-primary"
                      render={
                        <Link
                          href="/admin"
                          onClick={() => setNavbarOpen(false)}
                        />
                      }
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Quản trị hệ thống
                    </Button>
                  )}
                  {!isAdmin && (
                    <Button
                      variant="outline"
                      size="pill"
                      className="w-full gap-2"
                      render={
                        <Link
                          href="/account"
                          onClick={() => setNavbarOpen(false)}
                        />
                      }
                    >
                      <User className="w-5 h-5" />
                      Tài khoản của tôi
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="pill"
                    className="w-full gap-2"
                    onClick={() => {
                      localStorage.removeItem('access_token')
                      setIsLoggedIn(false)
                      setIsAdmin(false)
                      setIsStaff(false)
                      setNavbarOpen(false)
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="pill"
                  className="w-full"
                  onClick={() => {
                    setNavbarOpen(false)
                    setLoginOpen(true)
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        initialView={orderView}
      />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setIsLoggedIn(true)
          try {
            const token = localStorage.getItem('access_token')
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]))
              setIsAdmin(payload.role === 'ADMIN')
              setIsStaff(payload.role === 'STAFF')
            }
          } catch {
            // ignore
          }
        }}
      />
    </header>
  )
}
