"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  FileSpreadsheet, 
  Search, 
  Building, 
  Computer, 
  Calendar, 
  CreditCard, 
  Banknote, 
  FileText,
  Loader2,
  Trash2,
  CalendarDays,
  Clock,
  TrendingUp
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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodType>("bugun"); // Varsayılan: Bugünün Kasası
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  const supabase = createClient();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    const { data } = await supabase
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false });

    setReports(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu rapor kaydını silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("health_reports").delete().eq("id", id);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  }

  // Türkiye Takvimine Göre Zaman Filtreleme Sınırları
  const filtered = useMemo(() => {
    const now = new Date();

    // 1. Bugünün Başlangıcı (Gece 00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // 2. Bu Haftanın Başlangıcı (Pazartesi 00:00:00)
    // JS'de Pazar = 0, Pazartesi = 1, Salı = 2 ...
    const dayOfWeek = now.getDay(); 
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazar ise 6 gün geri, Salı ise 1 gün geri vb.
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

    // 3. Bu Ayın Başlangıcı (Ayın 1'i 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    return reports.filter((r) => {
      const itemDate = new Date(r.report_date);

      // Dönem Kontrolü
      if (period === "bugun" && itemDate < startOfToday) return false;
      if (period === "haftalik" && itemDate < startOfWeek) return false;
      if (period === "aylik" && itemDate < startOfMonth) return false;

      // Arama Kontrolü
      const matchesSearch = 
        r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        r.tc_no.includes(search) ||
        r.company_name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Bilgisayar (Rol) Filtresi
      if (filterRole !== "all" && r.created_by_role !== filterRole) return false;

      // Ödeme Yöntemi Filtresi
      if (filterPayment !== "all" && r.payment_method !== filterPayment) return false;

      return true;
    });
  }, [reports, period, search, filterRole, filterPayment]);

  // Kasa Hesaplamaları (Seçili Döneme Göre)
  const totalAmount = filtered.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashTotal = filtered.filter(r => r.payment_method === 'nakit').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const posTotal = filtered.filter(r => r.payment_method === 'pos').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cariTotal = filtered.filter(r => r.payment_method === 'cari').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const getPeriodLabel = () => {
    if (period === "bugun") return "Bugünün Toplamı";
    if (period === "haftalik") return "Bu Haftanın Toplamı (Pzt'den İtibaren)";
    if (period === "aylik") return "Bu Ayın Toplamı (1'inden İtibaren)";
    return "Tüm Zamanlar Toplamı";
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ÜST BAŞLIK, ZAMAN DİLİMİ BUTONLARI & KASA ÖZETİ */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        
        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d84315] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#d84315] animate-pulse" />
              Şirket Kasa & Finans Denetimi
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Gelen Sağlık Raporu Kayıtları</h1>
            <p className="text-xs text-slate-500">
              Nevşehir merkez şubemizdeki tüm kasa ve hasta giriş hareketleri.
            </p>
          </div>

          {/* DÖNEM SEÇİCİ BUTONLAR (Pazartesi Esaslı) */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 gap-1 flex-wrap">
            <button
              onClick={() => setPeriod("bugun")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === "bugun"
                  ? "bg-white text-[#d84315] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Bugün</span>
            </button>

            <button
              onClick={() => setPeriod("haftalik")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === "haftalik"
                  ? "bg-white text-[#d84315] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Bu Hafta (Pzt&apos;den Beri)</span>
            </button>

            <button
              onClick={() => setPeriod("aylik")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === "aylik"
                  ? "bg-white text-[#d84315] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Bu Ay</span>
            </button>

            <button
              onClick={() => setPeriod("tum")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === "tum"
                  ? "bg-white text-[#d84315] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tüm Geçmiş</span>
            </button>
          </div>
        </div>

        {/* ANLIK CANLI KASA KARTLARI */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toplam Ciro */}
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider">
              {getPeriodLabel()}
            </span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">
              ₺{totalAmount.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* Nakit Kasa */}
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block flex items-center gap-1">
              <Banknote className="h-3 w-3" /> Nakit Kasa
            </span>
            <span className="text-sm font-black text-emerald-900">
              ₺{cashTotal.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* POS / Kart Kasa */}
          <div className="bg-blue-50 border border-blue-200/80 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-blue-700 block flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> POS / Kart
            </span>
            <span className="text-sm font-black text-blue-900">
              ₺{posTotal.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* Cari / İşyeri */}
          <div className="bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-700 block flex items-center gap-1">
              <FileText className="h-3 w-3" /> Cari / İşyeri
            </span>
            <span className="text-sm font-black text-amber-900">
              ₺{cariTotal.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

      </div>

      {/* 2. ARAMA VE DETAYLI FİLTRELEME */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hasta Adı, TC Kimlik No veya Çalışacağı Firma ile Ara..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#d84315] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tüm Bilgisayarlar (Muhasebe + Alt Kat)</option>
            <option value="muhasebe">Sadece Muhasebe Masası</option>
            <option value="alt_kat">Sadece Alt Kat Bilgisayarı</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tüm Ödeme Yöntemleri</option>
            <option value="nakit">Nakit</option>
            <option value="pos">POS / Kredi Kartı</option>
            <option value="cari">Çalıştığı Yere (Cari)</option>
          </select>
        </div>
      </div>

      {/* 3. RAPOR LOGLARI TABLOSU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#d84315]" />
            <span>Kayıt Listesi ({filtered.length} Kişi)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Seçili Dönem: <strong className="text-slate-800">{getPeriodLabel()}</strong>
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#d84315]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Bu zaman diliminde eşleşen sağlık raporu kaydı bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tarih / Saat</th>
                  <th className="py-3 px-4">Kişi Bilgisi & TC</th>
                  <th className="py-3 px-4">Çalışacağı Yer</th>
                  <th className="py-3 px-4">Ödeme Biçimi & Tutar</th>
                  <th className="py-3 px-4">Kaydı Giren Yer</th>
                  <th className="py-3 px-4">Not / Açıklama</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(item.report_date).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.patient_name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{item.tc_no}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.company_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        {item.payment_method === "nakit" && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Banknote className="h-3 w-3" /> Nakit
                          </span>
                        )}
                        {item.payment_method === "pos" && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <CreditCard className="h-3 w-3" /> POS / Kart
                          </span>
                        )}
                        {item.payment_method === "cari" && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <FileText className="h-3 w-3" /> Cari / İşyeri
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-slate-900 mt-1">
                        ₺{Number(item.amount).toLocaleString("tr-TR")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.created_by_role === "muhasebe" ? (
                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-xl font-bold text-[11px] border border-blue-200">
                          <Building className="h-3 w-3 text-blue-600" />
                          <span>Muhasebe</span>
                        </div>
                      ) : item.created_by_role === "alt_kat" ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl font-bold text-[11px] border border-emerald-200">
                          <Computer className="h-3 w-3 text-emerald-600" />
                          <span>Alt Kat Bilgisayar</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-600">Yönetici</span>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.created_by_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.notes || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Kaydı Kalıcı Olarak Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}