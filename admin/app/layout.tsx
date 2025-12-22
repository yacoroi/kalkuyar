import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using standard Inter font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saadet Saha - Yönetim Paneli",
  description: "Teşkilat Operasyon Yönetimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50/50 min-h-screen`}>
        <Sidebar />
        <main className="flex-1 ml-72 p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
