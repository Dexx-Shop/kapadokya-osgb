"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Printer, 
  Mail, 
  Globe, 
  QrCode, 
  Send, 
  Navigation,
  CheckCircle2
} from "lucide-react";

export default function IletisimPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. ÜST HERO BAŞLIK */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#427fcb] via-[#6399dc] to-[#9ec6f2] pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Nevşehir İletişim
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="text-white/60">—</span>
            <span className="text-amber-200 font-semibold">Nevşehir İletişim</span>
          </div>
        </div>
      </section>

      {/* 2. İLETİŞİM KARTLARI (ESKİ SİTE BİLGİLERİ BİREBİR) */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* ADRES KARTI */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-7 sm:p-8 flex gap-4 transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-[#d84315]">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <h3 className="text-base font-extrabold text-slate-900">Adres</h3>
                <p className="text-slate-600 leading-relaxed">
                  15 Temmuz Mah. 101. Sok. <br />
                  No:139/B Merkez / NEVŞEHİR
                </p>
                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#d84315]" />
                    <span className="font-semibold">Telefon: (0384) 213 02 00</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Fax: (0384) 213 02 07</span>
                  </div>
                </div>
              </div>
            </div>

            {/* E-POSTA ADRESLERİMİZ */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-7 sm:p-8 flex gap-4 transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-[#d84315]">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-xs sm:text-sm flex-1">
                <h3 className="text-base font-extrabold text-slate-900">E-Posta Adreslerimiz</h3>
                <div className="space-y-2 pt-1 text-slate-600">
                  <div>
                    <a href="mailto:info@kapadokyadanismanlik.com" className="font-semibold text-slate-800 hover:text-[#d84315] transition block truncate">
                      info@kapadokyadanismanlik.com
                    </a>
                  </div>
                  <div>
                    <a href="mailto:bilgi@kapadokyadanismanlik.com" className="font-semibold text-slate-800 hover:text-[#d84315] transition block truncate">
                      bilgi@kapadokyadanismanlik.com
                    </a>
                  </div>
                  <div>
                    <a href="mailto:muhasebe@kapadokyaosgb.com.tr" className="font-semibold text-slate-800 hover:text-[#d84315] transition block truncate">
                      muhasebe@kapadokyaosgb.com.tr
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* DİĞER WEB ADRESİMİZ & YOL TARİFİ */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-7 sm:p-8 flex flex-col justify-between gap-4 transition hover:shadow-md">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-[#d84315]">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Diğer Web Adresimiz :</h3>
                  <a 
                    href="https://www.kapadokyaosgb.com.tr" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs sm:text-sm font-semibold text-[#d84315] hover:underline mt-1 block"
                  >
                    www.kapadokyaosgb.com.tr
                  </a>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=15+Temmuz+Mah+101+Sok+No:139/B+Nevsehir"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d84315] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95"
              >
                <Navigation className="h-4 w-4" />
                <span>Yol Tarifini Cep Telefonunuza Almak İçin Tıklayınız</span>
              </a>
            </div>

          </div>

          {/* QR KOD & GOOGLE HARİTA BÖLÜMÜ */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* QR Kod Alanı */}
            <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d84315]/10 text-[#d84315] mb-3">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="text-sm font-black text-slate-900">Konum QR Kodu</div>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                Kameranızı okutarak navigasyonu doğrudan telefonunuzda başlatın.
              </p>
              {/* QR Önizleme Çerçevesi */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://maps.google.com/?q=15+Temmuz+Mah+101+Sok+No:139/B+Nevsehir" 
                  alt="Konum QR" 
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>

            {/* Google Maps Haritası */}
            <div className="lg:col-span-9 h-[340px] sm:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-100">
              <iframe
                title="Kapadokya OSGB Nevşehir Konumu"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12457.771960144983!2d34.713889!3d38.625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152a6f3b0e3e29f3%3A0x6b77209935f1f0a!2s15%20Temmuz%20Mah.%20101.%20Sok.%20No%3A139%20Nev%C5%9Fehir!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 3. BİZİMLE İLETİŞİME GEÇİNİZ MESAJ FORMU */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-bold uppercase tracking-widest text-[#d84315]">
            Kapadokya Ortak Sağlık ve Güvenlik Birimi
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
            Bizimle İletişime Geçiniz
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Dilerseniz bize mesaj gönderebilirsiniz. En kısa sürede size dönüş sağlarız.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-left space-y-4">
            {sent && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm font-semibold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Mesajınız başarıyla iletildi. Yetkili ekibimiz en kısa sürede sizinle iletişime geçecektir.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Eymen Ulu"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numaranız *</label>
                <input
                  type="tel"
                  required
                  placeholder="0 (5XX) XXX XX XX"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresiniz</label>
              <input
                type="email"
                placeholder="ornek@sirketiniz.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mesajınız / Hizmet Talebiniz *</label>
              <textarea
                rows={4}
                required
                placeholder="İşletmeniz için danışmanlık, ortam ölçümü veya risk değerlendirmesi talebinizi belirtebilirsiniz..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d84315] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Mesajı Gönder</span>
              </button>
            </div>
          </form>

        </div>
      </section>

    </main>
  );
}