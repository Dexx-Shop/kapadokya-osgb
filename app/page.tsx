"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { CloudShader } from "@/components/ui/cloud-shader";
import { 
  ShieldCheck, 
  Stethoscope, 
  Flame, 
  FileSpreadsheet, 
  Activity, 
  Users, 
  ArrowRight, 
  PhoneCall, 
  Building2, 
  Award, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ImageIcon
} from "lucide-react";

const BackgroundClouds = memo(function BackgroundClouds() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <CloudShader
        className="h-full w-full"
        speed={0.6}
        count={6}
        skyTopColor="#4482cf"
        skyBottomColor="#a3ccf7"
        cloudColor="#ffffff"
      />
      <div className="absolute inset-0 bg-sky-900/10" />
    </div>
  );
});

const slides = [
  {
    badge: "Çalışma ve Sosyal Güvenlik Bakanlığı Onaylı",
    titlePrimary: "İş Yeriniz İçin",
    titleHighlight: "Eksiksiz Güvenlik,",
    titleSecondary: "Sıfır Ceza Riski.",
    description: "Kapadokya OSGB olarak iş sağlığı ve güvenliği süreçlerinizi yasal mevzuata %100 uyumlu yönetiyor, olası teftiş cezalarını önleyip çalışan sağlığını güvenceye alıyoruz.",
    ctaText: "Hizmetlerimizi İnceleyin",
    ctaLink: "/hizmetlerimiz",
    image: "/hero-1.jpg",
  },
  {
    badge: "Sağlık ve Hayat Kurtarma",
    titlePrimary: "İş Güvenliği Uzmanlığı ",
    titleHighlight: "Hizmeti ",
    // titleSecondary: "Zincirinde Tam Güvence.",
    description: "İş kazalarına karşı önceden hazırlıklı olun. Profesyonel işyeri hekimi, ilkyardım ve tahliye eğitimlerimizle çalışma ortamınızı eksiksiz koruyun.",
    ctaText: "İletişime Geçin",
    ctaLink: "/iletisim",
    image: "/hero-2.jpg",
  },
  {
    badge: "Neden Kapadokya OSGB?",
    titlePrimary: "Uzman Kadro ile",
    titleHighlight: "Güvenli Gelecek",
    titleSecondary: "ve Sürekli Denetim.",
    description: "Firmalara özel hazırlanmış iş sağlığı ve güvenliği çözümleri ile güvenlik standartlarının iyileştirilmesi amaçlanır. Bu doğrultuda kontrol ve denetlemeler, yönetim toplantıları, saha ziyaretleri ve dokümantasyon ve prosedür incelemeleri yapılarak gerçekleştirilir.",
    ctaText: "Kurumsal Profilimiz",
    ctaLink: "/kurumsal",
    image: "/hero-3.jpg",
  }
];

import { 
  Users2, 
  Rocket, 
  Megaphone,
} from "lucide-react";

const services = [
  {
    icon: Users2,
    title: "İş Güvenliği Uzmanlık Hizmeti",
    desc: "Firmalara özel hazırlanmış iş sağlığı ve güvenliği çözümleri ile güvenlik standartlarının iyileştirilmesi amaçlanır. Bu doğrultuda kontrol ve denetlemeler, yönetim toplantıları, saha ziyaretleri ve dokümantasyon ve prosedür incelemeleri yapılarak gerçekleştirilir.",
    color: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-[#d84315]"
  },
  {
    icon: Rocket,
    title: "İş Güvenliği Uzmanı İstihdamı",
    desc: "İşletmenizin bulunduğu risk grubuna ve ihtiyaçlarınıza cevap verebilecek uzmanlık alanlarına sahip, iş güvenliği uzmanları istihdam ederek yasal yükümlülüklerinizi eksiksiz ve güvenle yerine getirmenizi sağlıyoruz.",
    color: "from-purple-500/20 to-indigo-500/10",
    iconColor: "text-indigo-600"
  },
  {
    icon: Megaphone,
    title: "İş Sağlığı ve Güvenliği Dan. Hizmeti",
    desc: "İş Sağlığı ve Güvenliği çalışmaları, sadece yasal gereklilikleri yerine getirmek açısından değil, risklere maruz kalabilecek tüm çalışanların can güvenliğini korumak ve verimli çalışma ortamı oluşturmak için sunulur.",
    href: "/hizmetlerimiz/is-sagligi-ve-guvenligi-danismanlik",
    color: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-teal-600"
  }
];

const stats = [
  { label: "Bakanlık Yetkili Yıl", value: "12+", icon: Award },
  { label: "Hizmet Verilen Firma", value: "350+", icon: Building2 },
  { label: "Eğitilen Çalışan", value: "15.000+", icon: Users },
  { label: "Kesintisiz Saha Desteği", value: "7/24", icon: Clock },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. HERO BÖLÜMÜ */}
      <section className="relative overflow-hidden min-h-[720px] lg:min-h-[820px] pt-28 pb-16 sm:pt-32 sm:pb-20 flex items-center">
        
        <BackgroundClouds />

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* SOL METİN ALANI (6 Sütun) */}
            <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[430px] flex flex-col justify-center text-center lg:text-left">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-700 ease-in-out flex flex-col items-center lg:items-start space-y-5 ${
                    currentSlide === idx 
                      ? "opacity-100 translate-y-0 relative pointer-events-auto" 
                      : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                  }`}
                >
                  {/* Rozet */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#d84315] shadow-sm backdrop-blur-md">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#d84315]" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Başlık */}
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.3)]">
                    {slide.titlePrimary} <br />
                    <span className="text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                      {slide.titleHighlight}
                    </span>{" "}
                    {slide.titleSecondary}
                  </h1>

                  {/* Açıklama */}
                  <p className="text-sm sm:text-lg text-white font-medium max-w-xl leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
                    {slide.description}
                  </p>

                  {/* Butonlar */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                    <a
                      href={slide.ctaLink}
                      className="flex items-center justify-center gap-2.5 rounded-xl bg-[#d84315] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#d84315]/35 hover:bg-[#bf360c] transition active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="tel:+903840000000"
                      className="flex items-center justify-center gap-2.5 rounded-xl border border-white/70 bg-white/30 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/40 transition active:scale-95 backdrop-blur-md shadow-sm"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Hemen İletişime Geçin</span>
                    </a>
                  </div>
                </div>
              ))}

              {/* SLAYT KONTROLLERİ */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-6">
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Slayt ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx 
                          ? "w-8 bg-white shadow-md shadow-black/25" 
                          : "w-2.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={prevSlide}
                    aria-label="Önceki Slayt"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/20 text-white hover:bg-white hover:text-slate-900 transition backdrop-blur-md active:scale-90 shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Sonraki Slayt"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/20 text-white hover:bg-white hover:text-slate-900 transition backdrop-blur-md active:scale-90 shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* SAĞ ALAN: ÇERÇEVESİZ, BÜYÜK & HEYBETLİ GÖRSEL ALANI (6 Sütun) */}
            <div className="lg:col-span-6 relative flex items-center justify-center w-full">
              <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl transition-all">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      currentSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.titlePrimary}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />

                    {/* Resim henüz klasöre atılmadıysa gösterilecek şık yer tutucu */}
                    <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-6 text-center bg-white/30 backdrop-blur-md text-white">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 mb-3 shadow-sm">
                        <ImageIcon className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-base font-bold tracking-wide">
                        {slide.image.replace("/", "")}
                      </span>
                      <span className="text-xs text-white/80 mt-1">
                        Görseli doğrudan <code className="bg-black/25 px-1.5 py-0.5 rounded text-white">public/</code> içine atın
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. SAYAÇLAR */}
      <section className="border-b border-slate-200 bg-white py-12 shadow-sm relative z-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 transition hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d84315]/10 text-[#d84315]">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs font-semibold text-slate-500 leading-snug">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HİZMETLERİMİZ (ESKİ SİTEDEKİ 3 KARTIN MODERN VERSİYONU) */}
      <section className="py-20 sm:py-28 bg-slate-50 relative z-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#d84315]">Kurumsal Çözümler</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              İş Sağlığı & Güvenliğinde Uçtan Uca Hizmet
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Yasal şartları yerine getirirken çalışma alanlarınızda güvenli ve verimli bir ortam inşa ediyoruz.
            </p>
          </div>

          {/* 3'LÜ KART DÜZENİ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((srv, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-slate-100 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/60 flex flex-col justify-between"
              >
                <div>
                  {/* Eski sitedeki dairesel ikon tasarımının modern cam hali */}
                  <div className="flex justify-center mb-8">
                    <div className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${srv.color} p-4 transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                      <srv.icon className={`h-9 w-9 ${srv.iconColor}`} />
                      <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#d84315]" />
                    </div>
                  </div>

                  {/* Başlık */}
                  <h3 className="text-center text-xl font-bold text-slate-900 group-hover:text-[#d84315] transition-colors">
                    {srv.title}
                  </h3>

                  {/* Metin */}
                  <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">
                    {srv.desc}
                  </p>
                </div>

                {/* Eski sitedeki kiremit renkli butonun modern hali */}
                {/* <div className="pt-8 mt-6 flex justify-center">
                  <a
                    href={srv.href}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#d84315] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#d84315]/25 transition-all duration-200 hover:bg-[#bf360c] hover:shadow-lg active:scale-95"
                  >
                    <span>Devamı</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div> */}
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}