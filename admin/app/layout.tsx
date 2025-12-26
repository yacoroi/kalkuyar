'use client';

import PullToRefresh from "@/components/PullToRefresh";
import Sidebar from "@/components/Sidebar";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <title>KalkUyar - Yönetim Paneli</title>
        <meta name="description" content="Teşkilat Operasyon Yönetimi" />
      </head>
      <body className={`${inter.className} bg-gray-50/50 min-h-screen`}>
        <Sidebar />
        <main className="flex-1 ml-72 h-screen overflow-hidden">
          <PullToRefresh>
            <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full overflow-auto">
              {children}
            </div>
          </PullToRefresh>
        </main>
      </body>
    </html>
  );
}
