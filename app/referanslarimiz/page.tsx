"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { references } from "@/lib/referanslar-data";

export default function ReferanslarimizPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Üst Hero Başlık */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#427fcb] via-[#6399dc] to-[#9ec6f2] pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#d84315] shadow-sm backdrop-blur-md mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Güçlü Çözüm Ortaklıklarımız</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Referanslarımız
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="text-white/60">—</span>
            <span className="text-amber-200 font-semibold">Referanslarımız</span>
          </div>
        </div>
      </section>

      {/* Referanslar Logolar Gridi */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Türkiye&apos;nin Önde Gelen Kurumlarıyla Çalışıyoruz
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              İş sağlığı ve güvenliği alanında bizi tercih eden sanayi kuruluşları, belediyeler ve kamu kurumları.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {references.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-32 items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-xl hover:border-[#d84315]/40 transition-all duration-300"
              >
                {/* Logo */}
                <div className="relative h-16 w-full flex items-center justify-center">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={160}
                    height={70}
                    className="max-h-14 w-auto object-contain transition-all duration-300 group-hover:scale-95 group-hover:opacity-30"
                  />
                </div>

                {/* Hover Animasyonlu Overlay İsim Kartı */}
                <div className="pointer-events-none absolute inset-2 flex flex-col items-center justify-center rounded-xl bg-white/95 p-3 text-center opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 transform scale-90 group-hover:scale-100 group-hover:opacity-100 border border-slate-200/80">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight line-clamp-2">
                    {item.name}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#d84315]">
                    <span>Siteyi Ziyaret Et</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}