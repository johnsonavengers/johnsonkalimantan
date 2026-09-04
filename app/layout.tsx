import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JOHNSON UNTUK KALIMANTAN — Transparency Dashboard",
  description: "Dashboard transparansi JOHNSON UNTUK KALIMANTAN. Pantau perkembangan 10% alokasi penjualan campaign Johnson untuk Kalimantan, diperbarui setiap hari.",
  openGraph: {
    title: "JOHNSON UNTUK KALIMANTAN — Transparency Dashboard",
    description: "Pantau 10% alokasi penjualan campaign Johnson untuk Kalimantan. Transparan, setiap hari.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary",
    title: "JOHNSON UNTUK KALIMANTAN",
    description: "Dashboard transparansi alokasi penjualan campaign Johnson untuk Kalimantan.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
