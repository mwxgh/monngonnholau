"use client";

import { Fragment, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/fetch-admin";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Variant {
  id: number;
  sku: string;
  name: string;
  price: string;
  comparePrice: string | null;
  inventory: { quantity: number } | null;
}

interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  category: { name: string } | null;
  variants: Variant[];
  createdAt: string;
}

function formatVND(n: number) {
  return "₫" + n.toLocaleString("vi-VN");
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Đang bán",  className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
  INACTIVE: { label: "Tạm dừng", className: "text-gray-600 bg-gray-50 border border-gray-200" },
  DRAFT:    { label: "Nháp",     className: "text-amber-700 bg-amber-50 border border-amber-200" },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchAdmin(`${process.env.NEXT_PUBLIC_API_URL}/api/products/admin`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`);
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = filter ? products.filter((p) => p.status === filter) : products;

  const totalStock = (product: AdminProduct) =>
    product.variants.reduce((s, v) => s + (v.inventory?.quantity ?? 0), 0);

  const priceRange = (product: AdminProduct) => {
    const prices = product.variants.map((v) => Number(v.price));
    if (prices.length === 0) return "—";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Quản lý sản phẩm và tồn kho.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>{products.length} sản phẩm</CardDescription>
          </div>
          <div className="flex gap-1.5">
            {["", "ACTIVE", "INACTIVE", "DRAFT"].map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filter === value
                    ? "bg-primary text-white border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {value === "" ? "Tất cả" : STATUS_META[value]?.label}
                <span className="ml-1 font-normal">
                  ({value === "" ? products.length : products.filter((p) => p.status === value).length})
                </span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-xs text-muted-foreground">Thử đăng xuất và đăng nhập lại.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left pb-3 font-medium w-6" />
                    <th className="text-left pb-3 font-medium">Sản phẩm</th>
                    <th className="text-left pb-3 font-medium">Danh mục</th>
                    <th className="text-center pb-3 font-medium">Biến thể</th>
                    <th className="text-left pb-3 font-medium">Giá</th>
                    <th className="text-center pb-3 font-medium">Tồn kho</th>
                    <th className="text-center pb-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const isExpanded = expanded.has(product.id);
                    const stock = totalStock(product);
                    const s = STATUS_META[product.status] ?? { label: product.status, className: "" };
                    return (
                      <Fragment key={product.id}>
                        <tr
                          onClick={() => toggleExpand(product.id)}
                          className="border-b hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 pl-1 text-muted-foreground">
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4" />
                              : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="py-3">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {product.category?.name ?? "—"}
                          </td>
                          <td className="py-3 text-center text-sm">{product.variants.length}</td>
                          <td className="py-3 text-sm">{priceRange(product)}</td>
                          <td className="py-3 text-center">
                            <span className={cn(
                              "text-xs font-semibold",
                              stock === 0 ? "text-red-600" : stock <= 10 ? "text-amber-600" : "text-emerald-600",
                            )}>
                              {stock}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded variants */}
                        {isExpanded && product.variants.map((v) => (
                          <tr key={v.id} className="bg-muted/20 border-b">
                            <td />
                            <td colSpan={1} className="py-2 pl-6 text-xs text-muted-foreground font-mono">
                              {v.sku}
                            </td>
                            <td className="py-2 text-xs text-muted-foreground">{v.name}</td>
                            <td />
                            <td className="py-2 text-xs">
                              <span className="font-medium">{formatVND(Number(v.price))}</span>
                              {v.comparePrice && (
                                <span className="ml-1.5 line-through text-muted-foreground">
                                  {formatVND(Number(v.comparePrice))}
                                </span>
                              )}
                            </td>
                            <td className="py-2 text-center">
                              <span className={cn(
                                "text-xs font-semibold",
                                (v.inventory?.quantity ?? 0) === 0
                                  ? "text-red-600"
                                  : (v.inventory?.quantity ?? 0) <= 5
                                    ? "text-amber-600"
                                    : "text-emerald-600",
                              )}>
                                {v.inventory?.quantity ?? 0}
                              </span>
                            </td>
                            <td />
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        Không có sản phẩm nào.
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
