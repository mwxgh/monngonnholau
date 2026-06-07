"use client";

import { useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/fetch-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Customer {
  fullName: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

function formatVND(n: number) {
  return "₫" + n.toLocaleString("vi-VN");
}

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/customers`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`);
        setCustomers(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
      )
    : customers;

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Khách hàng</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Danh sách khách hàng theo số điện thoại.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Khách hàng", value: customers.length.toLocaleString("vi-VN") },
          { label: "Tổng đơn hàng", value: totalOrders.toLocaleString("vi-VN") },
          { label: "Tổng doanh thu", value: formatVND(totalRevenue) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Danh sách khách hàng</CardTitle>
            <CardDescription>{customers.length} khách hàng (theo SĐT)</CardDescription>
          </div>
          <input
            type="text"
            placeholder="Tìm tên hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-sm bg-background w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-500 py-10">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left pb-3 font-medium">#</th>
                    <th className="text-left pb-3 font-medium">Họ tên</th>
                    <th className="text-left pb-3 font-medium">Số điện thoại</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-center pb-3 font-medium">Đơn hàng</th>
                    <th className="text-right pb-3 font-medium">Đã chi</th>
                    <th className="text-right pb-3 font-medium">Đơn cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c, i) => (
                    <tr key={c.phone} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-3 font-medium">{c.fullName}</td>
                      <td className="py-3 font-mono text-sm">{c.phone}</td>
                      <td className="py-3 text-sm text-muted-foreground">{c.email ?? "—"}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {c.totalOrders}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold">{formatVND(c.totalSpent)}</td>
                      <td className="py-3 text-right text-xs text-muted-foreground">{formatDate(c.lastOrderAt)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        Không tìm thấy khách hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
