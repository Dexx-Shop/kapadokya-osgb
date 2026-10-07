"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Calculator, 
  FileSpreadsheet, 
  Send, 
  Clock, 
  Stethoscope, 
  ChevronDown, 
  UserCheck, 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  Search, 
  Banknote, 
  CreditCard, 
  FileText,
  Calendar,
  CalendarDays,
  TrendingUp,
  Loader2,
  X
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  recommended_price: number;
  tests: string[];
}

interface HealthReport {
  id: string;
  patient_name: string;
  tc_no: string;
  company_name: string;
  payment_method: "nakit" | "pos" | "cari";
  amount: number;
  notes: string;
  status: string;
  report_date: string;
  created_by_name: string;
  created_by_role: string;
  required_tests?: string[];
  completed_tests?: string[];
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

export default function MuhasebePanelPage() {
  const [activeTab, setActiveTab] = useState<"rapor_girisi" | "rapor_kayitlari">("rapor_girisi");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Veriler
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Dönem ve Arama Filtre State'leri (Admin Odasıyla Birebir)
  const currentNow = new Date();
  const [period, setPeriod] = useState<PeriodType>("bugun");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentNow.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentNow.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"hepsi" | "muhasebe" | "alt_kat">("hepsi");

  // Form State
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/giris-yap");
        return;
      }

      setCurrentUser(user);

      if (!isSuperAdminEmail(user.email)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, staff_role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin" && profile?.staff_role !== "muhasebe") {
          router.push("/");
          return;
        }
      }

      fetchCompanies();
      fetchReports();
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function fetchCompanies() {
    const { data } = await supabase.from("companies").select("*").order("name", { ascending: true });
    setCompanies(data || []);
  }

  async function fetchReports() {
    setReportsLoading(true);
    const { data } = await supabase.from("health_reports").select("*").order("report_date", { ascending: false });
    setReports(data || []);
    setReportsLoading(false);
  }

  // Realtime Canlı Dinleme
  useEffect(() => {
    const channel = supabase
      .channel("muhasebe_live_clean_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "health_reports" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const rec = payload.new as HealthReport;
          setReports((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as HealthReport;
          setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } else if (payload.eventType === "DELETE") {
          setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSelectCompany(compId: string) {
    setSelectedCompanyId(compId);
    if (compId === "diger") {
      setAmount("");
      return;
    }
    const found = companies.find((c) => c.id === compId);
    if (found && found.recommended_price) {
      setAmount(found.recommended_price.toString());
    }
  }

  // Doğrudan Kesin Rapor Girişi (Onay beklemeden tek tıkla işlenir)
  async function handleSendReport(e: React.FormEvent) {
    e.preventDefault();
    let finalCompanyName = "";
    let finalTests: string[] = [];

    if (selectedCompanyId === "diger") {
      if (!customCompanyName.trim()) {
        setMessage({ type: "error", text: "Lütfen firma adını yazınız." });
        return;
      }
      finalCompanyName = customCompanyName.trim();
      finalTests = ["Genel Tetkikler"];
    } else {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (!found) {
        setMessage({ type: "error", text: "Lütfen bir firma seçiniz." });
        return;
      }
      finalCompanyName = found.name;
      finalTests = found.tests || [];
    }

    if (!patientName.trim() || !tcNo.trim()) {
      setMessage({ type: "error", text: "Lütfen ad soyad ve TC kimlik alanlarını doldurun." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const userName = currentUser.user_metadata?.full_name || currentUser.email;

    const { error } = await supabase.from("health_reports").insert([
      {
        patient_name: patientName.trim(),
        tc_no: tcNo.trim(),
        company_name: finalCompanyName,
        payment_method: paymentMethod,
        amount: Number(amount) || 0,
        notes: notes.trim(),
        status: "tamamlandi", // DOĞRUDAN İŞLENİR
        report_date: new Date().toISOString(),
        created_by_name: userName,
        created_by_role: "muhasebe",
        required_tests: finalTests,
        completed_tests: finalTests,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Hata: " + error.message });
    } else {
      setMessage({ type: "success", text: `${patientName} sağlık raporu kaydı sisteme işlendi!` });
      setPatientName("");
      setTcNo("");
      setSelectedCompanyId("");
      setCustomCompanyName("");
      setAmount("");
      setNotes("");
    }
  }

  // Yıllar Listesi
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    reports.forEach((r) => {
      years.add(new Date(r.report_date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [reports]);

  // Filtrelenmiş Raporlar (Tarih, Dönem, Arama ve Giriş Yapan Rol Filtreli)
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

      // 2. Rol Filtresi (Muhasebe vs Uzman Girişi Ayrımı)
      if (roleFilter !== "hepsi") {
        if (roleFilter === "muhasebe" && r.created_by_role !== "muhasebe") return false;
        if (roleFilter === "alt_kat" && r.created_by_role !== "alt_kat") return false;
      }

      // 3. Arama Filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const formattedDateFull = itemDate.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const formattedDateSlash = formattedDateFull.replace(/\./g, "/");

        const nameMatch = (r.patient_name || "").toLowerCase().includes(query);
        const tcMatch = (r.tc_no || "").toLowerCase().includes(query);
        const compMatch = (r.company_name || "").toLowerCase().includes(query);
        const payMatch = (r.payment_method || "").toLowerCase().includes(query);
        const dateMatch = formattedDateFull.includes(query) || formattedDateSlash.includes(query);
        const testMatch = (r.completed_tests || []).some((t) => t.toLowerCase().includes(query));

        if (!nameMatch && !tcMatch && !compMatch && !payMatch && !dateMatch && !testMatch) {
          return false;
        }
      }

      return true;
    });
  }, [reports, period, selectedMonth, selectedYear, searchQuery, roleFilter]);

  // Ciro ve Kasa Toplamları
  const totalAmount = filteredReports.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashTotal = filteredReports.filter(r => r.payment_method === "nakit").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const posTotal = filteredReports.filter(r => r.payment_method === "pos").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cariTotal = filteredReports.filter(r => r.payment_method === "cari").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#07090e] flex flex-col items-center justify-center text-white">
        <Sparkles className="h-8 w-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Muhasebe Konsolu Açılıyor...
        </span>
      </div>
    );
  }

  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 overflow-y-auto selection:bg-emerald-500 selection:text-white">
      
      {/* ARKA PLAN IŞIK EFEKTLERİ */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ÜST MİNİ BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/paneller"
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold transition active:scale-95 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Personel Portalı'na Dön</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <span>Muhasebe & Sağlık Raporu Konsolu</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px]">{currentUser?.user_metadata?.full_name || currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Oturumu Kapat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* İÇERİK MERKEZİ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* SOL: MUHASEBE SIDEBAR */}
        <aside className="lg:col-span-3 rounded-3xl bg-white/[0.03] border border-emerald-500/20 p-5 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/25">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Finans & Kayıt</div>
              <h2 className="text-base font-black text-white">Muhasebe Paneli</h2>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("rapor_girisi")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "rapor_girisi"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Sağlık Raporu Girişi</span>
            </button>

            <button
              onClick={() => setActiveTab("rapor_kayitlari")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "rapor_kayitlari"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4" />
                <span>Rapor Kayıtları (Loglar)</span>
              </div>
              <span className="bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {reports.length}
              </span>
            </button>
          </nav>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Yeni sağlık raporu girişi yapabilir, tarih ve role göre filtrelenmiş tüm kayıt ve ciro loglarını inceleyebilirsiniz.
            </p>
          </div>
        </aside>

        {/* SAĞ: ÇALIŞMA ALANI */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: SAĞLIK RAPORU GİRİŞİ */}
          {activeTab === "rapor_girisi" && (
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Yeni Hasta / Müşteri Kaydı Aç</h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date().toLocaleDateString("tr-TR")} {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {message && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold border ${
                  message.type === "success" 
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSendReport} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Kişinin Adı Soyadı *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">T.C. Kimlik No *</label>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      value={tcNo}
                      onChange={(e) => setTcNo(e.target.value)}
                      placeholder="11 haneli kimlik no"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Çalışacağı Firma / Yer *</label>
                    <div className="relative">
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => handleSelectCompany(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none transition shadow-sm cursor-pointer pr-8"
                      >
                        <option value="">-- Firma Seçiniz --</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.recommended_price ? `(Tavsiye: ₺${c.recommended_price})` : ""}
                          </option>
                        ))}
                        <option value="diger">➕ Listede Yok (Elle Giriş / Şahıs)</option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {selectedCompanyId === "diger" && (
                      <input
                        type="text"
                        required
                        placeholder="Firma / İşyeri Adını Yazınız"
                        value={customCompanyName}
                        onChange={(e) => setCustomCompanyName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {selectedCompanyObj && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-300">İstenen Tetkikler: </span>
                        <span className="text-slate-200 font-medium">
                          {selectedCompanyObj.tests?.length ? selectedCompanyObj.tests.join(" • ") : "Standart Tetkikler"}
                        </span>
                      </div>
                    </div>
                    {selectedCompanyObj.recommended_price > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-slate-400">Tavsiye Edilen: </span>
                        <strong className="text-emerald-400 font-black text-sm">₺{selectedCompanyObj.recommended_price}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Ödeme Alınma Biçimi *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none transition shadow-sm"
                    >
                      <option value="nakit">💵 Nakit</option>
                      <option value="pos">💳 POS / Kredi Kartı</option>
                      <option value="cari">📑 Cari (Firma Hesabı)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tahsil Edilecek Tutar (TL)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Ek Not (Varsa)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Örn: Fatura istendi, tahlil teslim edildi vb."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition shadow-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? "Kaydediliyor..." : "Rapor Kaydını Tamamla"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SAĞLIK RAPORU KAYITLARI & CANLI KASA TAKİBİ (ADMİN PANELİYLE BİREBİR AYNI) */}
          {activeTab === "rapor_kayitlari" && (
            <div className="w-full rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-md space-y-6 animate-in fade-in">
              
              {/* Başlık ve Dönem Filtre Butonları */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
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
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
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
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-emerald-500/20 animate-in fade-in slide-in-from-top-1">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mr-1">
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
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
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

                <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Cari / İşyeri
                  </span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    ₺{cariTotal.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* ROL FİLTRESİ & ARAMA ÇUBUĞU */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-8 relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tarih (örn: 01/10), TC Kimlik No, Kişi İsmi, Firma veya Test ara..."
                    className="w-full rounded-2xl bg-white/[0.05] border border-white/15 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
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

                <div className="sm:col-span-4 relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="w-full appearance-none rounded-2xl bg-slate-900 border border-white/15 px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none transition cursor-pointer pr-8"
                  >
                    <option value="hepsi">Tüm Kayıtlar (Muhasebe + Uzman)</option>
                    <option value="muhasebe">Sadece Muhasebe Girişleri</option>
                    <option value="alt_kat">Sadece Uzman (Alt Kat) Girişleri</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* RAPORLAR LİSTESİ TABLOSU */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                  <span>
                    Kayıtlar ({filteredReports.length} Kişi)
                    {searchQuery && <span className="text-emerald-300 ml-1 font-bold">"{searchQuery}" filtrelendi</span>}
                  </span>
                  <button 
                    onClick={fetchReports}
                    className="text-emerald-400 hover:underline cursor-pointer text-[11px]"
                  >
                    Yenile
                  </button>
                </div>

                {reportsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
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
                          <th className="py-2.5 px-3">Giren Birim</th>
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

                            {/* GİREN BİRİM (MUHASEBE VS UZMAN AYRIMI) */}
                            <td className="py-2.5 px-3">
                              {item.created_by_role === "alt_kat" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                  Uzman (Alt Kat)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  Muhasebe
                                </span>
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
          )}

        </main>
      </div>

    </div>
  );
}