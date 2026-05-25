import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  weight: ["700", "900"],
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mon Ngon Nho Lau — Đồ nhà làm, mẹ tự tay chế biến",
  description: "Bơ lạc, bơ hạt điều, thịt lợn khô, chuối sấy mộc và nhiều hơn nữa — tất cả đều thủ công, không chất bảo quản, từ bàn tay mẹ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
