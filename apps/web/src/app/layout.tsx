import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Món Ngon Nhớ Lâu — Đồ nhà làm, mẹ tự tay chế biến",
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
        {children}
        {process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID && (
          <Script
            id="tawk-to"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                var Tawk_API=Tawk_API||{},Tawk_LoadTime=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/${process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}/${process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "default"}';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
