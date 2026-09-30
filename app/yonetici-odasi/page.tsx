"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOTHER_EMAIL, isSuperAdminEmail } from "@/lib/constants";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calculator, 
  Sparkles, 
  Flower2, 
  Wind, 
  Coffee, 
  Stethoscope, 
  Clock, 
  Compass, 
  FileCheck2, 
  Building2, 
  Gavel, 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  Banknote, 
  CreditCard, 
  FileText, 
  CalendarDays, 
  TrendingUp, 
  Calendar,
  Loader2,
  Heart,
  ChevronDown
} from "lucide-react";

interface ReportItem {
  id: string;
  patient_name: string;
  tc_no: string;
  company_name: string;
  payment_method: "nakit" | "pos" | "cari";
  amount: number;
  notes: string;
  report_date: string;
  created_by_name: string;
  created_by_role: string;
}

type PeriodType = "bugun" | "haftalik" | "aylik" | "tum";

const MONTHS = [
  { value: 0, label: "Ocak" },
  { value: 1, label: "Şubat" },
  { value: 2, label: "Mart" },
  { value: 3, label: "Nisan" },
  { value: 4, label: "Mayıs" },
  { value: 5, label: "Haziran" },
  { value: 6, label: "Temmuz" },
  { value: 7, label: "Ağustos" },
  { value: 8, label: "Eylül" },
  { value: 9, label: "Ekim" },
  { value: 10, label: "Kasım" },
  { value: 11, label: "Aralık" },
];

export default function ExecutiveSuitePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sağlık Raporları ve Kasa State'leri
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("bugun");

  // Ay ve Yıl Seçimi State'leri (Varsayılan olarak şu anki ay ve yıl)
  const currentNow = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentNow.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentNow.getFullYear());

  // Babanın KDV & Tevkifat Hesaplayıcısı
  const [calcAmount, setCalcAmount] = useState<string>("");
  const [calcKdvRate, setCalcKdvRate] = useState<number>(20);
  const [includeTevkifat, setIncludeTevkifat] = useState<boolean>(false);

  // Babanın Hızlı Kişi Başı Rapor Teklifi Hesaplayıcısı
  const [personCount, setPersonCount] = useState<string>("");
  const [pricePerPerson, setPricePerPerson] = useState<string>("");

  // Annenin Nefes & Su Takibi State'leri
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Nefes Al (4s)" | "Tut (4s)" | "Ver (4s)" | "Bekle (4s)">("Nefes Al (4s)");
  const [waterCount, setWaterCount] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function verify() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isSuperAdminEmail(user.email)) {
        router.push("/");
        return;
      }

      setUserEmail(user.email || null);

      const savedWater = localStorage.getItem("exec_suite_water");
      if (savedWater) setWaterCount(Number(savedWater));

      setLoading(false);
      loadReports();
    }

    verify();
  }, [router, supabase]);

  async function loadReports() {
    setReportsLoading(true);
    const { data } = await supabase
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false });

    setReports(data || []);
    setReportsLoading(false);
  }

  // Türkiye Takvimine Göre Zaman Filtreleme Sınırları
  const filteredReports = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

    return reports.filter((r) => {
      const itemDate = new Date(r.report_date);
      if (period === "bugun") return itemDate >= startOfToday;
      if (period === "haftalik") return itemDate >= startOfWeek;
      if (period === "aylik") {
        // Seçilen Ay ve Yıla göre tam filtreleme (0 = Ocak, 11 = Aralık)
        return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
      }
      return true; // "tum"
    });
  }, [reports, period, selectedMonth, selectedYear]);

  // Kasa Toplamları
  const totalAmount = filteredReports.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashTotal = filteredReports.filter(r => r.payment_method === "nakit").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const posTotal = filteredReports.filter(r => r.payment_method === "pos").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cariTotal = filteredReports.filter(r => r.payment_method === "cari").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Annenin Nefes Döngüsü
  useEffect(() => {
    if (!breathingActive) return;
    const phases: Array<"Nefes Al (4s)" | "Tut (4s)" | "Ver (4s)" | "Bekle (4s)"> = [
      "Nefes Al (4s)",
      "Tut (4s)",
      "Ver (4s)",
      "Bekle (4s)"
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setBreathPhase(phases[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  function addWater() {
    const next = waterCount + 1;
    setWaterCount(next);
    localStorage.setItem("exec_suite_water", next.toString());
  }

  // Raporların olduğu mevcut yılları dinamik bul
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    reports.forEach((r) => {
      years.add(new Date(r.report_date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [reports]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0b0f17] flex flex-col items-center justify-center text-white">
        <Sparkles className="h-8 w-8 animate-spin text-amber-400 mb-3" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Yönetici Odası Açılıyor...</span>
      </div>
    );
  }

  const isMother = userEmail?.toLowerCase() === MOTHER_EMAIL.toLowerCase();

  return (
    <div className={`fixed inset-0 z-[9999] overflow-y-auto selection:bg-amber-500 selection:text-white ${
      isMother 
        ? "bg-[#0c0916] text-slate-100" 
        : "bg-[#0b0f17] text-slate-100"
    }`}>
      
      {/* ÜST BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold transition active:scale-95 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kapadokya OSGB Sitesine Dön</span>
          </Link>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <span className="text-xs font-semibold text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>Kişiselleştirilmiş Yönetim Paneli</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-white">
              {isMother ? "Neslihan Ulu" : "Dr. Salim Ulu"}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isMother ? "text-rose-400" : "text-amber-400"}`}>
              {isMother ? "Kurucu Ortak & Yönetici" : "Şirket Sahibi & Kurucu Hekim"}
            </div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black text-sm shadow-inner ${
            isMother ? "bg-gradient-to-tr from-rose-500 to-purple-600 text-white" : "bg-gradient-to-tr from-amber-500 to-[#d84315] text-white"
          }`}>
            {isMother ? "N" : "S"}
          </div>
        </div>
      </header>

      {/* İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. ANNENİN ÖZEL ALANI (NESLİHAN ULU) */}
        {/* ========================================================================= */}
        {isMother ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* NESLİHAN ULU PRESTİJ HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-950/70 via-[#140f24] to-[#0c0916] border border-rose-500/30 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-rose-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
              <div className="absolute -bottom-10 right-10 w-60 h-60 bg-rose-600/10 blur-2xl pointer-events-none rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 px-5 py-1.5 text-xs font-black text-rose-300 border border-rose-500/40 shadow-sm backdrop-blur-md">
                  <Flower2 className="h-4 w-4 text-rose-400 animate-pulse" />
                  <span className="tracking-wider uppercase">Kapadokya OSGB • Kurucu Ortak & Yönetici</span>
                </div>

                <div className="relative py-2 transition-transform duration-300 hover:scale-[1.02]">
                  <Image
                    src="/neslihanlogo.png"
                    alt="Neslihan Ulu"
                    width={560}
                    height={110}
                    className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(244,63,94,0.35)] brightness-110 contrast-125"
                    priority
                  />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                  Şirketinizin anlık sağlık raporu akışı, kasa gelirleri, zihin tazeleyici nefes modülü ve kişisel takip alanınız.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-2 backdrop-blur-md text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-rose-400" />
                    <span>{new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-rose-300 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Yönetici Odası Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ALT ÇALIŞMA ALANI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Sol Kolon: FARKINDALIK & SAĞLIK TAKİBİ */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wind className="h-4 w-4 text-rose-400" />
                      <span>1 Dakikalık Zihin Dinlendirme</span>
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      Yoga & Odak
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Yoğun tempo arasında 4 saniyelik kare nefes temposuyla sakinleşin ve zihninizi toparlayın.
                  </p>

                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className={`flex h-36 w-36 items-center justify-center rounded-full transition-all duration-1000 ${
                      breathingActive 
                        ? "bg-rose-500/20 border-4 border-rose-400 scale-110 shadow-2xl shadow-rose-500/30" 
                        : "bg-white/5 border-2 border-white/10 scale-100"
                    }`}>
                      <span className="text-center text-xs font-bold text-rose-200 px-3">
                        {breathingActive ? breathPhase : "Nefese Başla"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setBreathingActive(!breathingActive)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                        breathingActive 
                          ? "bg-white/15 text-white hover:bg-white/25" 
                          : "bg-gradient-to-r from-rose-600 to-purple-600 text-white hover:opacity-90 shadow-rose-600/30"
                      }`}
                    >
                      {breathingActive ? "Egzersizi Durdur" : "Nefes Egzersizini Başlat"}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-sky-400" />
                      <span>Günlük Su & Sağlık Takibi</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Bugün tüketilen: <strong className="text-sky-400">{waterCount} Bardak Su</strong></p>
                  </div>
                  <button
                    onClick={addWater}
                    className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/30 transition cursor-pointer active:scale-95"
                  >
                    +1 Bardak İçtim
                  </button>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-rose-950/30 to-purple-950/30 border border-rose-500/20 p-5 text-xs italic text-rose-200 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1.5 text-amber-300 font-bold not-italic">
                    <Heart className="h-4 w-4 text-rose-400" />
                    <span>Günün İlhamı</span>
                  </div>
                  &ldquo;Düşüncelerin sakinleştiğinde, her karmaşanın arkasındaki berrak çözümü görürsün. Bugün senin günün.&rdquo;
                </div>
              </div>

              {/* Sağ Kolon: SAĞLIK RAPORLARI & KASA LOGLARI MODÜLÜ */}
              <div className="lg:col-span-7 rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md space-y-5">
                
                {/* Başlık ve Dönem Filtre Butonları */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-rose-400" />
                      <span>Sağlık Raporu Kayıtları & Kasa Takibi</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Muhasebe ve Alt Kat bilgisayarlarından girilen anlık sağlık raporları.
                    </p>
                  </div>

                  {/* Dönem Butonları */}
                  <div className="inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 gap-1 flex-wrap shrink-0">
                    <button
                      onClick={() => setPeriod("bugun")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "bugun"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>Bugün</span>
                    </button>

                    <button
                      onClick={() => setPeriod("haftalik")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "haftalik"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>Haftalık</span>
                    </button>

                    <button
                      onClick={() => setPeriod("aylik")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "aylik"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CalendarDays className="h-3 w-3" />
                      <span>Aylık</span>
                    </button>

                    <button
                      onClick={() => setPeriod("tum")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "tum"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>Tümü</span>
                    </button>
                  </div>
                </div>

                {/* AYLIK SEÇİLDİĞİNDE BELİREN ÖZEL AY VE YIL AÇILIR LİSTELERİ */}
                {period === "aylik" && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] border border-rose-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mr-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>İncelenecek Ay:</span>
                    </span>

                    {/* Ay Seçimi */}
                    <div className="relative">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Yıl Seçimi */}
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:border-rose-400 focus:outline-none cursor-pointer"
                      >
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr} className="bg-slate-900 text-white">
                            {yr}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <span className="text-[11px] text-slate-400 ml-auto font-medium">
                      {MONTHS[selectedMonth].label} {selectedYear} dönemi verileri listeleniyor
                    </span>
                  </div>
                )}

                {/* KASA ÖZETİ KARTLARI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-rose-300 block">
                      Toplam Ciro
                    </span>
                    <span className="text-base font-black text-emerald-400 mt-0.5 block">
                      ₺{totalAmount.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                      <Banknote className="h-3 w-3" /> Nakit Kasa
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{cashTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> POS / Kart
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{posTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Cari / İşyeri
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{cariTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* RAPORLAR LİSTESİ TABLOSU */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Kayıtlar ({filteredReports.length} Kişi)</span>
                    <button 
                      onClick={loadReports}
                      className="text-rose-400 hover:underline cursor-pointer text-[11px]"
                    >
                      Yenile
                    </button>
                  </div>

                  {reportsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin text-rose-400" />
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
                      {period === "aylik" 
                        ? `${MONTHS[selectedMonth].label} ${selectedYear} ayında girilmiş bir sağlık raporu kaydı bulunmuyor.`
                        : "Bu zaman diliminde girilmiş bir sağlık raporu kaydı bulunmuyor."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.01]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-slate-400 uppercase font-bold sticky top-0 backdrop-blur-md border-b border-white/10">
                          <tr>
                            <th className="py-2.5 px-3">Tarih</th>
                            <th className="py-2.5 px-3">Kişi & TC</th>
                            <th className="py-2.5 px-3">Firma</th>
                            <th className="py-2.5 px-3">Ödeme</th>
                            <th className="py-2.5 px-3 text-right">Tutar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredReports.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.03] transition">
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                                {new Date(item.report_date).toLocaleString("tr-TR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-white">{item.patient_name}</div>
                                <div className="text-slate-500 font-mono text-[10px]">{item.tc_no}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 max-w-[140px] truncate">
                                {item.company_name}
                              </td>
                              <td className="py-2.5 px-3">
                                {item.payment_method === "nakit" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                    <Banknote className="h-3 w-3" /> Nakit
                                  </span>
                                )}
                                {item.payment_method === "pos" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400">
                                    <CreditCard className="h-3 w-3" /> POS/Kart
                                  </span>
                                )}
                                {item.payment_method === "cari" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400">
                                    <FileText className="h-3 w-3" /> Cari
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-white">
                                ₺{Number(item.amount).toLocaleString("tr-TR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* 2. BABANIN ÖZEL ALANI (DR. SALİM ULU) */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* DR. SALİM ULU PRESTİJ HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0e1420] to-[#070a0f] border border-amber-500/30 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/20 via-orange-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
              <div className="absolute -bottom-10 right-10 w-60 h-60 bg-amber-600/10 blur-2xl pointer-events-none rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-5 py-1.5 text-xs font-black text-amber-300 border border-amber-500/40 shadow-sm backdrop-blur-md">
                  <Stethoscope className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="tracking-wider uppercase">Kapadokya OSGB • Kurucu Hekim & Şirket Sahibi</span>
                </div>

                <div className="relative py-2 transition-transform duration-300 hover:scale-[1.02]">
                  <Image
                    src="/drsalimlogo.png"
                    alt="Dr. Salim Ulu"
                    width={560}
                    height={110}
                    className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(251,191,36,0.35)] brightness-110 contrast-125"
                    priority
                  />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                  İhale platformları, bakanlık entegrasyonları, anlık maliyet analizleri ve canlı sağlık raporu kasa denetimi tek ekranda.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-2 backdrop-blur-md text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-emerald-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Yönetim Sistemi Çevrimiçi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BABANIN PORTALLARI */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>Sık Kullanılan Resmi Kurum & İhale Portalları</span>
                </span>
                <span className="text-[11px] text-amber-400/80 font-medium">Hızlı Güvenli Bağlantılar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="https://ekapv2.kik.gov.tr/"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all flex flex-col justify-between backdrop-blur-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Gavel className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-amber-300 transition">
                          EKAP v2
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                      Elektronik Kamu Alımları Platformu & İhale Sorgulama
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-amber-400 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    EKAP Sistemine Git →
                  </span>
                </a>

                <a
                  href="https://ihaleciler.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all flex flex-col justify-between backdrop-blur-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <FileCheck2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-amber-300 transition">
                          İhaleciler.com
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                      Türkiye Geneli İSG & Sağlık Hizmet Alım İlanları
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-emerald-400 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    İhaleleri İncele →
                  </span>
                </a>

                <a
                  href="https://mbys.saglik.gov.tr/Account/Login"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all flex flex-col justify-between backdrop-blur-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-amber-300 transition">
                          MBYS Giriş
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                      T.C. Sağlık Bakanlığı Mekansal Bilgi Yönetim Sistemi
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-rose-400 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    Sisteme Giriş Yap →
                  </span>
                </a>

                <a
                  href="https://isgkatip.csgb.gov.tr"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all flex flex-col justify-between backdrop-blur-md shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-white group-hover:text-amber-300 transition">
                          İSG-KÂTİP
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">
                      Çalışma Bakanlığı İş Güvenliği Uzmanı & Hekim Sözleşmeleri
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-blue-400 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    Sözleşmelere Git →
                  </span>
                </a>
              </div>
            </div>

            {/* ALT ÇALIŞMA ALANI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Sol Kolon: HESAPLAYICILAR */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-amber-400" />
                      <span>Hızlı Fatura & Tevkifat Hesaplayıcı</span>
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Mali Hesap
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Matrah Bedeli (TL)</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      placeholder="Örn: 25000"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">KDV Oranı</label>
                      <select
                        value={calcKdvRate}
                        onChange={(e) => setCalcKdvRate(Number(e.target.value))}
                        className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
                      >
                        <option value={20}>%20 (İSG & OSGB)</option>
                        <option value={10}>%10</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTevkifat}
                          onChange={(e) => setIncludeTevkifat(e.target.checked)}
                          className="rounded text-amber-500"
                        />
                        <span>5/10 Tevkifat</span>
                      </label>
                    </div>
                  </div>

                  {calcAmount && Number(calcAmount) > 0 && (() => {
                    const base = Number(calcAmount);
                    const kdvVal = base * (calcKdvRate / 100);
                    const tevkifatVal = includeTevkifat ? kdvVal * 0.5 : 0;
                    const grandTotal = base + kdvVal - tevkifatVal;

                    return (
                      <div className="mt-3 rounded-2xl bg-white/[0.04] p-3.5 border border-white/10 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Hizmet Matrahı:</span>
                          <strong className="text-white">₺{base.toLocaleString("tr-TR")}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>KDV (%{calcKdvRate}):</span>
                          <strong className="text-white">₺{kdvVal.toLocaleString("tr-TR")}</strong>
                        </div>
                        {includeTevkifat && (
                          <div className="flex justify-between text-amber-400 font-semibold">
                            <span>Tevkif Edilen KDV:</span>
                            <span>-₺{tevkifatVal.toLocaleString("tr-TR")}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-amber-400">
                          <span>Tahsil Edilecek Tutar:</span>
                          <span>₺{grandTotal.toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span>Toplu Rapor / Muayene Teklif Hesaplayıcı</span>
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Teklif Pratiği
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Çalışan Sayısı</label>
                      <input
                        type="number"
                        value={personCount}
                        onChange={(e) => setPersonCount(e.target.value)}
                        placeholder="Örn: 45"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Kişi Başı Ücret (TL)</label>
                      <input
                        type="number"
                        value={pricePerPerson}
                        onChange={(e) => setPricePerPerson(e.target.value)}
                        placeholder="Örn: 850"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {Number(personCount) > 0 && Number(pricePerPerson) > 0 && (
                    <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 flex items-center justify-between text-xs">
                      <span className="text-emerald-200 font-bold">Öngörülen Teklif Tutarı:</span>
                      <span className="text-base font-black text-emerald-400">
                        ₺{(Number(personCount) * Number(pricePerPerson)).toLocaleString("tr-TR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ Kolon: SAĞLIK RAPORLARI LOGLARI */}
              <div className="lg:col-span-7 rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                      <span>Sağlık Raporu Kayıtları & Kasa Takibi</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Muhasebe ve Alt Kat bilgisayarlarından girilen anlık sağlık raporları.
                    </p>
                  </div>

                  <div className="inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 gap-1 flex-wrap shrink-0">
                    <button
                      onClick={() => setPeriod("bugun")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "bugun"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>Bugün</span>
                    </button>

                    <button
                      onClick={() => setPeriod("haftalik")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "haftalik"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>Haftalık</span>
                    </button>

                    <button
                      onClick={() => setPeriod("aylik")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "aylik"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CalendarDays className="h-3 w-3" />
                      <span>Aylık</span>
                    </button>

                    <button
                      onClick={() => setPeriod("tum")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        period === "tum"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>Tümü</span>
                    </button>
                  </div>
                </div>

                {/* AYLIK SEÇİLDİĞİNDE BELİREN ÖZEL AY VE YIL AÇILIR LİSTELERİ */}
                {period === "aylik" && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] border border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mr-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>İncelenecek Ay:</span>
                    </span>

                    {/* Ay Seçimi */}
                    <div className="relative">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Yıl Seçimi */}
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr} className="bg-slate-900 text-white">
                            {yr}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <span className="text-[11px] text-slate-400 ml-auto font-medium">
                      {MONTHS[selectedMonth].label} {selectedYear} dönemi verileri listeleniyor
                    </span>
                  </div>
                )}

                {/* KASA ÖZETİ KARTLARI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">
                      Toplam Ciro
                    </span>
                    <span className="text-base font-black text-emerald-400 mt-0.5 block">
                      ₺{totalAmount.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                      <Banknote className="h-3 w-3" /> Nakit Kasa
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{cashTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> POS / Kart
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{posTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Cari / İşyeri
                    </span>
                    <span className="text-sm font-black text-white mt-0.5 block">
                      ₺{cariTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* RAPORLAR LİSTESİ TABLOSU */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Kayıtlar ({filteredReports.length} Kişi)</span>
                    <button 
                      onClick={loadReports}
                      className="text-amber-400 hover:underline cursor-pointer text-[11px]"
                    >
                      Yenile
                    </button>
                  </div>

                  {reportsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
                      {period === "aylik" 
                        ? `${MONTHS[selectedMonth].label} ${selectedYear} ayında girilmiş bir sağlık raporu kaydı bulunmuyor.`
                        : "Bu zaman diliminde girilmiş bir sağlık raporu kaydı bulunmuyor."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.01]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-slate-400 uppercase font-bold sticky top-0 backdrop-blur-md border-b border-white/10">
                          <tr>
                            <th className="py-2.5 px-3">Tarih</th>
                            <th className="py-2.5 px-3">Kişi & TC</th>
                            <th className="py-2.5 px-3">Firma</th>
                            <th className="py-2.5 px-3">Ödeme</th>
                            <th className="py-2.5 px-3 text-right">Tutar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredReports.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.03] transition">
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                                {new Date(item.report_date).toLocaleString("tr-TR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-white">{item.patient_name}</div>
                                <div className="text-slate-500 font-mono text-[10px]">{item.tc_no}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 max-w-[140px] truncate">
                                {item.company_name}
                              </td>
                              <td className="py-2.5 px-3">
                                {item.payment_method === "nakit" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                    <Banknote className="h-3 w-3" /> Nakit
                                  </span>
                                )}
                                {item.payment_method === "pos" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400">
                                    <CreditCard className="h-3 w-3" /> POS/Kart
                                  </span>
                                )}
                                {item.payment_method === "cari" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                                    <FileText className="h-3 w-3" /> Cari
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-white">
                                ₺{Number(item.amount).toLocaleString("tr-TR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}