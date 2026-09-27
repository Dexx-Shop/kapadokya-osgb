import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://kapadokyaosgb.com'),
  title: 'Kapadokya OSGB - Ortak Sağlık ve Güvenlik Birimi | Nevşehir',
  description: 'Nevşehir Kapadokya OSGB - İş Sağlığı ve Güvenliği, Mobil Sağlık, İşe Giriş Sağlık Raporu ve Periyodik Muayene Hizmetleri.',
  keywords: ['Kapadokya OSGB', 'Nevşehir OSGB', 'İş Sağlığı ve Güvenliği Nevşehir', 'Sağlık Raporu Nevşehir', 'Kapadokya Sağlık'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}