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
  FileSpreadsheet, 
  Banknote, 
  CreditCard, 
  FileText, 
  CalendarDays, 
  TrendingUp, 
  Calendar,
  Loader2,
  Heart,
  ChevronDown,
  Search,
  X,
  PieChart,
  Users
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
  completed_tests?: string[];
  required_tests?: string[];
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
  const [searchQuery, setSearchQuery] = useState("");

  // Üst Tablo Ay ve Yıl Seçimi
  const currentNow = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentNow.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentNow.getFullYear());

  // Alt Tablo (Firma Bazlı Gelir Dökümü) Ay ve Yıl Seçimi
  const [summaryMonth, setSummaryMonth] = useState<number>(currentNow.getMonth());
  const [summaryYear, setSummaryYear] = useState<number>(currentNow.getFullYear());

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

  // Türkiye Takvimine & Arama Filtresine Göre Filtreleme
  const filteredReports = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

    return reports.filter((r) => {
      const itemDate = new Date(r.report_date);

      // 1. Dönem Filtresi
      if (period === "bugun" && itemDate < startOfToday) return false;
      if (period === "haftalik" && itemDate < startOfWeek) return false;
      if (period === "aylik") {
        if (itemDate.getMonth() !== selectedMonth || itemDate.getFullYear() !== selectedYear) {
          return false;
        }
      }

      // 2. Akıllı Metin & Tarih & TC & Test Arama Filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const formattedDateFull = itemDate.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        const formattedDateSlash = formattedDateFull.replace(/\./g, "/");
        const formattedShortSlash = formattedDateSlash.substring(0, 5);

        const nameMatch = (r.patient_name || "").toLowerCase().includes(query);
        const tcMatch = (r.tc_no || "").toLowerCase().includes(query);
        const companyMatch = (r.company_name || "").toLowerCase().includes(query);
        const paymentMatch = (r.payment_method || "").toLowerCase().includes(query);
        const noteMatch = (r.notes || "").toLowerCase().includes(query);
        
        const dateMatch = 
          formattedDateFull.includes(query) || 
          formattedDateSlash.includes(query) || 
          formattedShortSlash.includes(query);

        const testMatch = (r.completed_tests || []).some((t) => t.toLowerCase().includes(query));

        if (!nameMatch && !tcMatch && !companyMatch && !paymentMatch && !noteMatch && !dateMatch && !testMatch) {
          return false;
        }
      }

      return true;
    });
  }, [reports, period, selectedMonth, selectedYear, searchQuery]);

  // Kasa Toplamları
  const totalAmount = filteredReports.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashTotal = filteredReports.filter(r => r.payment_method === "nakit").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const posTotal = filteredReports.filter(r => r.payment_method === "pos").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cariTotal = filteredReports.filter(r => r.payment_method === "cari").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // ALT TABLO: SEÇİLEN AY VE YILA GÖRE FİRMA BAZLI HESAPLAMA
  const companyMonthlyStats = useMemo(() => {
    // Seçilen ay ve yıldaki raporlar
    const monthReports = reports.filter((r) => {
      const d = new Date(r.report_date);
      return d.getMonth() === summaryMonth && d.getFullYear() === summaryYear;
    });

    const map = new Map<string, {
      companyName: string;
      patientCount: number;
      nakitTotal: number;
      posTotal: number;
      cariTotal: number;
      grandTotal: number;
    }>();

    monthReports.forEach((r) => {
      const rawName = (r.company_name || "Belirtilmemiş").trim();
      const normKey = rawName.toLowerCase();
      const amount = Number(r.amount || 0);

      if (!map.has(normKey)) {
        map.set(normKey, {
          companyName: rawName,
          patientCount: 0,
          nakitTotal: 0,
          posTotal: 0,
          cariTotal: 0,
          grandTotal: 0,
        });
      }

      const item = map.get(normKey)!;
      item.patientCount += 1;
      item.grandTotal += amount;

      if (r.payment_method === "nakit") item.nakitTotal += amount;
      else if (r.payment_method === "pos") item.posTotal += amount;
      else if (r.payment_method === "cari") item.cariTotal += amount;
    });

    return Array.from(map.values()).sort((a, b) => b.grandTotal - a.grandTotal);
  }, [reports, summaryMonth, summaryYear]);

  // Alt Tablo Genel Toplamları
  const companyStatsGrandTotal = companyMonthlyStats.reduce((acc, c) => acc + c.grandTotal, 0);
  const companyStatsTotalPatients = companyMonthlyStats.reduce((acc, c) => acc + c.patientCount, 0);
  const companyStatsNakit = companyMonthlyStats.reduce((acc, c) => acc + c.nakitTotal, 0);
  const companyStatsPos = companyMonthlyStats.reduce((acc, c) => acc + c.posTotal, 0);
  const companyStatsCari = companyMonthlyStats.reduce((acc, c) => acc + c.cariTotal, 0);

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
            
            {/* NESLİHAN ULU HERO BANNER */}
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
                  Şirketinizin anlık sağlık raporu akışı, kasa gelirleri, tetkik dökümleri ve zihin tazeleyici nefes modülü.
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

            {/* FARKINDALIK ÇUBUĞU */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300">
                    <Wind className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">1 Dk Kare Nefes</h3>
                    <p className="text-[11px] text-slate-400">{breathingActive ? breathPhase : "Dinginlik & Odak"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBreathingActive(!breathingActive)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
                >
                  {breathingActive ? "Durdur" : "Başlat"}
                </button>
              </div>

              <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Su Takibi</h3>
                    <p className="text-[11px] text-slate-400">Bugün: <strong className="text-sky-300">{waterCount} Bardak</strong></p>
                  </div>
                </div>
                <button
                  onClick={addWater}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition cursor-pointer"
                >
                  +1 Bardak
                </button>
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20 p-5 flex items-center gap-3 backdrop-blur-md">
                <Heart className="h-5 w-5 text-rose-400 shrink-0" />
                <p className="text-[11px] italic text-rose-200 leading-snug">
                  &ldquo;Düşüncelerin sakinleştiğinde, her karmaşanın arkasındaki çözümü görürsün.&rdquo;
                </p>
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
                  İhale platformları, bakanlık sistemleri, yapılan tetkik dökümleri ve şirket gelir/hasta analizleri tek merkezde.
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

            {/* BABANIN RESMİ PORTALLARI */}
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

          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. ANA TABLO: SAĞLIK RAPORU KAYITLARI & CANLI KASA TAKİBİ (TAM GENİŞLİK) */}
        {/* ========================================================================= */}
        <div className="w-full rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {/* Başlık ve Dönem Filtre Butonları */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className={`h-5 w-5 ${isMother ? "text-rose-400" : "text-amber-400"}`} />
                <span>Sağlık Raporu Kayıtları & Kasa Takibi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Canlı ciro, yapılan tetkik dökümleri ve hasta giriş akışı.
              </p>
            </div>

            {/* Dönem Butonları */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 gap-1 flex-wrap shrink-0">
              <button
                onClick={() => setPeriod("bugun")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  period === "bugun"
                    ? isMother ? "bg-rose-600 text-white shadow-md" : "bg-amber-500 text-slate-950 shadow-md"
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
                    ? isMother ? "bg-rose-600 text-white shadow-md" : "bg-amber-500 text-slate-950 shadow-md"
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
                    ? isMother ? "bg-rose-600 text-white shadow-md" : "bg-amber-500 text-slate-950 shadow-md"
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
                    ? isMother ? "bg-rose-600 text-white shadow-md" : "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                <span>Tümü</span>
              </button>
            </div>
          </div>

          {/* AYLIK SEÇİLDİĞİNDE BELİREN AY VE YIL AÇILIR LİSTELERİ */}
          {period === "aylik" && (
            <div className={`flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border animate-in fade-in slide-in-from-top-1 ${
              isMother ? "border-rose-500/20" : "border-amber-500/20"
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 mr-1 ${isMother ? "text-rose-300" : "text-amber-300"}`}>
                <CalendarDays className="h-3.5 w-3.5" />
                <span>İncelenecek Ay:</span>
              </span>

              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3 py-1.5 pr-8 text-xs font-bold text-white focus:outline-none cursor-pointer"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <span className={`text-[10px] uppercase font-bold block ${isMother ? "text-rose-300" : "text-amber-300"}`}>
                Toplam Ciro
              </span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                ₺{totalAmount.toLocaleString("tr-TR")}
              </span>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5" /> Nakit Kasa
              </span>
              <span className="text-base font-black text-white mt-0.5 block">
                ₺{cashTotal.toLocaleString("tr-TR")}
              </span>
            </div>

            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
              <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" /> POS / Kart
              </span>
              <span className="text-base font-black text-white mt-0.5 block">
                ₺{posTotal.toLocaleString("tr-TR")}
              </span>
            </div>

            <div className={`rounded-2xl p-4 border ${
              isMother 
                ? "bg-purple-500/10 border-purple-500/20" 
                : "bg-amber-500/10 border-amber-500/20"
            }`}>
              <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${isMother ? "text-purple-300" : "text-amber-300"}`}>
                <FileText className="h-3.5 w-3.5" /> Cari / İşyeri
              </span>
              <span className="text-base font-black text-white mt-0.5 block">
                ₺{cariTotal.toLocaleString("tr-TR")}
              </span>
            </div>
          </div>

          {/* EVRENSEL ARAMA ÇUBUĞU */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tarih (örn: 01/10), TC Kimlik No, Kişi İsmi, Firma veya Yapılan Test ara..."
              className={`w-full rounded-2xl bg-white/[0.05] border border-white/15 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition ${
                isMother ? "focus:border-rose-400" : "focus:border-amber-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* RAPORLAR LİSTESİ TABLOSU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span>
                Kayıtlar ({filteredReports.length} Kişi)
                {searchQuery && <span className={`${isMother ? "text-rose-300" : "text-amber-300"} ml-1 font-bold`}>"{searchQuery}" filtrelendi</span>}
              </span>
              <button 
                onClick={loadReports}
                className={`${isMother ? "text-rose-400" : "text-amber-400"} hover:underline cursor-pointer text-[11px]`}
              >
                Yenile
              </button>
            </div>

            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className={`h-7 w-7 animate-spin ${isMother ? "text-rose-400" : "text-amber-400"}`} />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
                {searchQuery 
                  ? `"${searchQuery}" aramasına uygun bir sağlık raporu bulunamadı.` 
                  : "Bu zaman diliminde girilmiş bir sağlık raporu kaydı bulunmuyor."}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.01]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 uppercase font-bold sticky top-0 backdrop-blur-md border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Kişi & TC</th>
                      <th className="py-2.5 px-3">Firma</th>
                      <th className="py-2.5 px-3">Yapılan Tetkikler</th>
                      <th className="py-2.5 px-3">Ödeme</th>
                      <th className="py-2.5 px-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReports.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono">
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
                        <td className="py-2.5 px-3 text-slate-300 font-medium max-w-[150px] truncate">
                          {item.company_name}
                        </td>

                        {/* YAPILAN TETKİKLER */}
                        <td className="py-2.5 px-3 max-w-[280px]">
                          {item.completed_tests && item.completed_tests.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.completed_tests.map((test, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium"
                                >
                                  {test}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Genel Muayene</span>
                          )}
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
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isMother ? "text-purple-400" : "text-amber-400"}`}>
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

        {/* ========================================================================= */}
        {/* 2. YENİ ALT TABLO: FİRMA BAZLI RAPOR & HAKEDİŞ / GELİR ANALİZİ */}
        {/* ========================================================================= */}
        <div className="w-full rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {/* Başlık ve Ay/Yıl Filtresi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <PieChart className={`h-5 w-5 ${isMother ? "text-rose-400" : "text-amber-400"}`} />
                <span>Firma Bazlı Rapor & Hakediş Dökümü</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Seçtiğiniz ayda hangi firmadan kaç çalışan geldiğini ve toplam ne kadar ciro/ödeme alındığını görün.
              </p>
            </div>

            {/* Ay ve Yıl Seçimi */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(Number(e.target.value))}
                  className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3.5 py-1.5 pr-8 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(Number(e.target.value))}
                  className="appearance-none rounded-xl bg-slate-900 border border-white/15 px-3.5 py-1.5 pr-8 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border hidden sm:inline-block ${
                isMother 
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}>
                {MONTHS[summaryMonth].label} {summaryYear}
              </span>
            </div>
          </div>

          {/* İSTATİSTİK ÖZET KARTLARI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Firma Sayısı
              </span>
              <span className="text-lg font-black text-white mt-0.5 block">
                {companyMonthlyStats.length} Firma
              </span>
            </div>

            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
              <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
                <Users className="h-3 w-3" /> Toplam Hasta / Rapor
              </span>
              <span className="text-lg font-black text-white mt-0.5 block">
                {companyStatsTotalPatients} Kişi
              </span>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                <Banknote className="h-3 w-3" /> Tahsil Edilen (Nakit+POS)
              </span>
              <span className="text-base font-black text-emerald-400 mt-0.5 block">
                ₺{(companyStatsNakit + companyStatsPos).toLocaleString("tr-TR")}
              </span>
            </div>

            <div className={`rounded-2xl p-4 border ${
              isMother 
                ? "bg-purple-500/10 border-purple-500/20" 
                : "bg-amber-500/10 border-amber-500/20"
            }`}>
              <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${isMother ? "text-purple-300" : "text-amber-300"}`}>
                <FileText className="h-3 w-3" /> Faturalanacak Cari Tutar
              </span>
              <span className="text-base font-black text-white mt-0.5 block">
                ₺{companyStatsCari.toLocaleString("tr-TR")}
              </span>
            </div>
          </div>

          {/* FİRMA BAZLI TABLO */}
          {companyMonthlyStats.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
              {MONTHS[summaryMonth].label} {summaryYear} ayında herhangi bir firmaya ait sağlık raporu kaydı bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase font-bold sticky top-0 backdrop-blur-md border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Firma / Kurum Adı</th>
                    <th className="py-3 px-4 text-center">Gelen Çalışan Sayısı</th>
                    <th className="py-3 px-4 text-right">Nakit Tahsilat</th>
                    <th className="py-3 px-4 text-right">POS / Kart</th>
                    <th className="py-3 px-4 text-right">Cari Alacak</th>
                    <th className="py-3 px-4 text-right font-black text-white">Toplam Hakediş</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companyMonthlyStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-sm">{item.companyName}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs">
                          {item.patientCount} Kişi
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-medium">
                        ₺{item.nakitTotal.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-medium">
                        ₺{item.posTotal.toLocaleString("tr-TR")}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isMother ? "text-purple-300" : "text-amber-300"}`}>
                        ₺{item.cariTotal.toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">
                        ₺{item.grandTotal.toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* GENEL TOPLAM SATIRI */}
                <tfoot className="bg-white/[0.05] border-t-2 border-white/15 font-black text-xs text-white">
                  <tr>
                    <td className="py-3.5 px-4 text-slate-300 uppercase tracking-wider">
                      Genel Toplam ({companyMonthlyStats.length} Firma)
                    </td>
                    <td className="py-3.5 px-4 text-center text-blue-300">
                      {companyStatsTotalPatients} Kişi
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      ₺{companyStatsNakit.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      ₺{companyStatsPos.toLocaleString("tr-TR")}
                    </td>
                    <td className={`py-3.5 px-4 text-right ${isMother ? "text-purple-300" : "text-amber-300"}`}>
                      ₺{companyStatsCari.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 text-base">
                      ₺{companyStatsGrandTotal.toLocaleString("tr-TR")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}