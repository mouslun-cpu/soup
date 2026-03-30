import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Need 挖掘機｜海龜湯教學版",
  description: "透過海龜湯遊戲，訓練學生從表面現象挖掘深層需求",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // 防止移動端縮放影響遊戲體驗
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-[#0a0e1a] text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
