"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, 
  MapPin, 
  ArrowRight, 
  Quote,
  Globe2,
  ChevronLeft
} from "lucide-react";

// Müşteri Yorumları Verisi (İleride sadece burayı güncelleyebilirsin)
const testimonials = [
  {
    quote: "Alanında uzman çalışanları ve kaliteli hizmet anlayışı ile birlikte çalışmaktan keyif aldığımız, anlayışlı ve hoşgörülü personelleriyle her zaman çalışmak isteyeceğiniz çözüm ortağı. İyi ki tanışmışız.",
    author: "Aras Kurt",
    role: "Firma Yöneticisi / Müşteri Deneyimi",
    initials: "AK",
    color: "from-[#d84315] to-[#f4511e]"
  },
  {
    quote: "Fabrikamızın risk analizi ve periyodik ortam ölçümlerinde gösterdikleri titizlik sayesinde yasal denetimlerden sıfır eksikle geçtik. Sahadaki İSG uzmanlarının disiplini ve ilgisi takdire şayan.",
    author: "Mehmet Demir",
    role: "Üretim & Tesis Müdürü",
    initials: "MD",
    color: "from-blue-600 to-indigo-600"
  },
  {
    quote: "Şantiye süreçlerimizde çalışanlarımızın iş sağlığı ve güvenliği eğitimlerini eksiksiz tamamladılar. Acil durum eylem planlarında sundukları proaktif çözümler için Kapadokya OSGB ekibine teşekkür ederiz.",
    author: "Selin Çelik",
    role: "İnsan Kaynakları & İSG Koordinatörü",
    initials: "SÇ",
    color: "from-emerald-600 to-teal-600"
  },
  {
    quote: "İşyeri hekimliği ve sağlık raporu süreçlerimizde sağladıkları hızlı geri dönüşler iş gücü kaybımızı ciddi oranda azalttı. Güvenilir ve kurumsal bir firma ile çalışmak büyük rahatlık.",
    author: "Caner Yıldız",
    role: "Genel Müdür Yardımcısı",
    initials: "CY",
    color: "from-amber-600 to-orange-500"
  }
];

export default function KurumsalPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 6 saniyede bir otomatik geçiş
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      
      {/* 1. ÜST ŞIK & SADE GÖKYÜZÜ BAŞLIK ALANI */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#427fcb] via-[#6399dc] to-[#9ec6f2] pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Kurumsal
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="text-white/60">—</span>
            <span className="text-amber-200 font-semibold">Kurumsal</span>
          </div>
        </div>
      </section>

      {/* 2. ANA İÇERİK: GENİŞLETİLMİŞ GÖRSEL + METİNLER */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* SOL ALAN: DAHA GENİŞ FOTOĞRAF + ALTINDA FAALİYET SAHASI */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              
              <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
                <Image
                  src="/kurumsal-ofis.jpg"
                  alt="Kapadokya Danışmanlık ve OSGB"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>

              {/* Fotonun Altına Alınan Faaliyet Sahası Paneli */}
              <div className="rounded-2xl border border-slate-100 bg-slate-900 p-5 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d84315] text-white shadow-md">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff7043] block">
                      Bölgesel Hizmet Ağı
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Geniş Kapsamlı Faaliyet Sahası
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Başta <strong className="text-white">Nevşehir</strong>, <strong className="text-white">Adana</strong>, <strong className="text-white">Muğla</strong>, <strong className="text-white">Hatay</strong> olmak üzere tüm <strong className="text-white">İç Anadolu Bölgesi</strong> ve çevre illerde akredite saha teftişi ve tam kapsamlı İSG hizmetleri sunmaktayız.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {["Nevşehir", "Adana", "Muğla", "Hatay", "İç Anadolu"].map((city) => (
                    <span 
                      key={city}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700/60"
                    >
                      <MapPin className="h-3 w-3 text-[#d84315]" />
                      <span>{city}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* SAĞ ALAN: HAKKIMIZDA METNİ VE VİZYON / MİSYON */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6 pt-2">
              
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d84315]">
                <span className="h-2 w-2 rounded-full bg-[#d84315]" />
                <span>HAKKIMIZDA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-[1.25] tracking-tight">
                Hızlı ve çözümleyici bir firma ile çalışmak ister misiniz? Misafirimiz olun...
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Kapadokya Danışmanlık 2012 yılı başında Çalışma ve Sosyal Güvenlik Bakanlığı’ndan OSGB yetkisi almış bir firmadır. Nevşehir, Aksaray ve Kırşehir illerinde faaliyet göstermektedir.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Kapadokya Danışmanlık siz değerli müşterileri ile sahip olduğu bilgi ve tecrübe paylaşmanın heyecanını duyan genç, dinamik, enerji dolu ve çözüm odaklı bir firmadır.
              </p>

              {/* VİZYONUMUZ */}
              <div className="pt-2">
                <div className="flex items-start gap-4 p-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d84315] text-white shadow-md shadow-[#d84315]/25 mt-0.5">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      VİZYONUMUZ :
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Öncelikle yurtiçinde ulaşılan başarılı konumunu sürekli geliştirerek, iş sağlığı ve güvenliği hizmetlerinde faaliyet göstermektedir. Aynı zamanda tecrübesi, bilgisi, dinamik ve yetkin kadrosuyla girişimci, sağduyulu, müşteri odaklı yaklaşımıyla &ldquo;Mükemmel Hizmet Şirketi&rdquo; olmaktır.
                    </p>
                  </div>
                </div>
              </div>

              {/* MİSYONUMUZ */}
              <div>
                <div className="flex items-start gap-4 p-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d84315] text-white shadow-md shadow-[#d84315]/25 mt-0.5">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      MİSYONUMUZ :
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Uzmanlığımız ve deneyimlerimiz ışığında özgün hizmet anlayışı ve güncel bilgi kullanımıyla, müşterilerimizin iş ihtiyaçlarına yapmış olduğu uzmanlık konularında birebir proaktif ve sonuç odaklı cevap veren çözümler geliştirmektir.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. DİNAMİK & HAREKETLİ MÜŞTERİ YORUMU SLIDER'I */}
      <section className="py-20 bg-[#0c1228] text-white relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Sol: Sabit Başlık Alanı */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff7043]">
                YORUMLAR
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Müşterilerimizden <br /> Yorumlar
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                İş birliği yaptığımız çözüm ortaklarımızın tecrübeleri ve değerlendirmeleri.
              </p>

              {/* Slider Manuel Kontrol Butonları */}
              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Önceki Yorum"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-[#d84315] hover:border-[#d84315] transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Sonraki Yorum"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-[#d84315] hover:border-[#d84315] transition active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sağ: Hareketli Değişen Yorum Kartı */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9 backdrop-blur-md min-h-[260px] flex flex-col justify-between shadow-2xl">
                
                {/* Animasyonlu İçerik */}
                <div 
                  key={currentIndex} 
                  className="animate-in fade-in zoom-in-[0.98] duration-500"
                >
                  <Quote className="h-8 w-8 text-[#d84315] mb-3 opacity-80" />
                  
                  <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-200">
                    &ldquo;{testimonials[currentIndex].quote}&rdquo;
                  </p>

                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3.5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr ${testimonials[currentIndex].color} font-bold text-white text-sm shadow-md`}>
                      {testimonials[currentIndex].initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {testimonials[currentIndex].author}
                      </div>
                      <div className="text-xs text-slate-400">
                        {testimonials[currentIndex].role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Sayfalama Noktaları (Indicators) */}
                <div className="flex items-center gap-1.5 pt-4">
                  {testimonials.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentIndex(dotIdx)}
                      aria-label={`Yorum ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIndex === dotIdx 
                          ? "w-6 bg-[#d84315]" 
                          : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. REFERANSLARIMIZ ŞERİDİ */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-12">
            BİRLİKTE BAŞARIYA ULAŞTIĞIMIZ DEĞERLİ REFERANSLARIMIZ
          </h3>

          {/* 6'lı Logolar Şeridi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center">
            {[
              { name: "TCDD", logo: "/referanslar/tcdd.png", url: "https://www.tcdd.gov.tr" },
              { name: "Nevşehir Belediyesi", logo: "/referanslar/nevsehir-belediyesi.png", url: "https://www.nevsehir.bel.tr" },
              { name: "Votorantim Cimentos", logo: "/referanslar/votorantim.png", url: "https://www.votorantimcimentos.com.tr" },
              { name: "Meysu", logo: "/referanslar/meysu.png", url: "https://www.meysu.com.tr" },
              { name: "Netaş", logo: "/referanslar/netas.png", url: "https://www.netas.com.tr" },
              { name: "Gülsan", logo: "/referanslar/gulsan.png", url: "https://www.gulsan.com.tr" },
            ].map((item, i) => (
              <a 
                key={i} 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-28 items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-xl hover:border-[#d84315]/30 transition-all duration-300"
              >
                {/* Logo */}
                <div className="relative h-14 w-full flex items-center justify-center">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={140}
                    height={60}
                    className="max-h-12 w-auto object-contain transition-all duration-300 group-hover:scale-95 group-hover:opacity-40"
                  />
                </div>

                {/* Mouse Gelince Çıkan Animasyonlu İsim Kartı (Tooltip/Overlay) */}
                <div className="pointer-events-none absolute inset-x-2 inset-y-2 flex items-center justify-center rounded-xl bg-white/95 px-3 py-2 text-center opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 transform scale-90 group-hover:scale-100 group-hover:opacity-100 border border-slate-200/80">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                    {item.name}
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/referanslarimiz"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d84315] px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 cursor-pointer"
            >
              <span>Referanslarımız</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}