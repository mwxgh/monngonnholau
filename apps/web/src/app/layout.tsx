import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat/chat-widget";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mon Ngon Nho Lau — Đồ nhà làm, mẹ tự tay chế biến",
  description:
    "Bơ lạc, bơ hạt điều, thịt lợn khô, chuối sấy mộc — tất cả đều thủ công, không chất bảo quản, từ bàn tay mẹ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
