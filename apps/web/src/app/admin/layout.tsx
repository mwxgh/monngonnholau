"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/analytics", label: "Phân tích", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      if (isExpired || payload.role !== "ADMIN") {
        localStorage.removeItem("access_token");
        router.replace("/");
        return;
      }
      setUser({ email: payload.email });
    } catch {
      localStorage.removeItem("access_token");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-50",
          "flex flex-col transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo / header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border px-4 shrink-0",
            collapsed ? "lg:justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground truncate">
              MNNL Admin
            </span>
          )}
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            <ChevronLeft
              className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")}
            />
          </Button>
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  collapsed && "lg:justify-center lg:px-2",
                  active
                    ? "bg-primary text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          {collapsed ? (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  localStorage.removeItem("access_token");
                  router.replace("/");
                }}
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Quản trị viên</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-sidebar-accent shrink-0"
                onClick={() => {
                  localStorage.removeItem("access_token");
                  router.replace("/");
                }}
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64",
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-background border-b flex items-center px-4 gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </Button>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Về trang chủ
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
