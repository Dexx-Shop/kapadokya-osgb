"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Calculator, 
  FileSpreadsheet, 
  Send, 
  Check, 
  ArrowUpCircle, 
  Edit2, 
  Trash2, 
  Clock, 
  Save, 
  X, 
  Stethoscope, 
  ChevronDown,
  UserCheck
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
  status: "bekliyor" | "alt_kat_tamamlandi" | "tamamlandi";
  report_date: string;
  created_by_name: string;
  created_by_role: string;
  required_tests?: string[];
  completed_tests?: string[];
}

export default function MuhasebePanelPage() {
  const [activeTab, setActiveTab] = useState<"rapor_girisi">("rapor_girisi");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Veriler
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Düzenleme Modali State
  const [editingItem, setEditingItem] = useState<HealthReport | null>(null);
  const [editPatientName, setEditPatientName] = useState("");
  const [editTcNo, setEditTcNo] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const now = new Date();
    setReportDate(`${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`);

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
    const { data } = await supabase.from("health_reports").select("*").order("report_date", { ascending: false });
    setReports(data || []);
  }

  // Realtime Dinleme
  useEffect(() => {
    const channel = supabase
      .channel("muhasebe_live_channel")
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

  async function handleSendToAltKat(e: React.FormEvent) {
    e.preventDefault();
    let finalCompanyName = "";
    let finalTests: string[] = [];

    if (selectedCompanyId === "diger") {
      if (!customCompanyName.trim()) {
        setMessage({ type: "error", text: "Lütfen firma adını yazınız." });
        return;
      }
      finalCompanyName = customCompanyName.trim();
      finalTests = ["Akciğer Grafisi", "İşitme Testi", "Genel Muayene"];
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
        status: "bekliyor",
        report_date: new Date().toISOString(),
        created_by_name: userName,
        created_by_role: "muhasebe",
        required_tests: finalTests,
        completed_tests: [],
      },
    ]);

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Hata: " + error.message });
    } else {
      setMessage({ type: "success", text: `${patientName} alt kata sevk edildi!` });
      setPatientName("");
      setTcNo("");
      setSelectedCompanyId("");
      setCustomCompanyName("");
      setAmount("");
      setNotes("");
    }
  }

  async function handleMuhasebeFinalize(reportId: string) {
    await supabase.from("health_reports").update({ status: "tamamlandi" }).eq("id", reportId);
  }

  async function handleDelete(reportId: string, name: string) {
    if (!confirm(`${name} isimli hastanın kaydını silmek istediğinize emin misiniz?`)) return;
    await supabase.from("health_reports").delete().eq("id", reportId);
  }

  function openEditModal(item: HealthReport) {
    setEditingItem(item);
    setEditPatientName(item.patient_name);
    setEditTcNo(item.tc_no);
    setEditCompanyName(item.company_name);
    setEditPaymentMethod(item.payment_method);
    setEditAmount(item.amount.toString());
    setEditNotes(item.notes || "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    const { error } = await supabase
      .from("health_reports")
      .update({
        patient_name: editPatientName.trim(),
        tc_no: editTcNo.trim(),
        company_name: editCompanyName.trim(),
        payment_method: editPaymentMethod,
        amount: Number(editAmount) || 0,
        notes: editNotes.trim(),
      })
      .eq("id", editingItem.id);

    if (!error) setEditingItem(null);
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-500">Yükleniyor...</div>;
  }

  const altKatBekleyenler = reports.filter((r) => r.status === "bekliyor");
  const muhasebeKontrolBekleyenler = reports.filter((r) => r.status === "alt_kat_tamamlandi");
  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SOL: MUHASEBE SIDEBAR */}
        <aside className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Finans & Kayıt</div>
              <h2 className="text-base font-black text-slate-900">Muhasebe Paneli</h2>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("rapor_girisi")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "rapor_girisi"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Sağlık Raporu Girişi</span>
              </div>
              {muhasebeKontrolBekleyenler.length > 0 && (
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {muhasebeKontrolBekleyenler.length}
                </span>
              )}
            </button>
          </nav>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="truncate">{currentUser?.user_metadata?.full_name || currentUser?.email}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Müşteri kaydını yapıp alt kata sevk edebilir, dönen müşterileri onaylayabilirsiniz.
            </p>
          </div>
        </aside>

        {/* SAĞ: ÇALIŞMA ALANI */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* ALT KATTAN GELEN KONTROL BEKLEYEN HASTALAR */}
          {muhasebeKontrolBekleyenler.length > 0 && (
            <div className="rounded-3xl bg-amber-50/90 border border-amber-200 p-6 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-amber-600 animate-bounce" />
                  <h3 className="text-sm font-bold text-amber-900">
                    Alt Kattan Çıkanlar (Kontrol & Onay Bekliyor)
                  </h3>
                </div>
                <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {muhasebeKontrolBekleyenler.length} Kişi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {muhasebeKontrolBekleyenler.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900">{item.patient_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.tc_no} • {item.company_name}</div>
                      <div className="text-xs font-bold text-emerald-600">₺{item.amount} ({item.payment_method.toUpperCase()})</div>
                      {item.completed_tests && item.completed_tests.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Yapılan: {item.completed_tests.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <button
                        onClick={() => handleMuhasebeFinalize(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Kontrol Edildi</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer text-[11px] flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Düzenle</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.patient_name)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HASTA KAYIT FORMU */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Yeni Hasta / Müşteri Kaydı Aç</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">{reportDate}</span>
            </div>

            {message && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border ${
                message.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSendToAltKat} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kişinin Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">T.C. Kimlik No *</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    value={tcNo}
                    onChange={(e) => setTcNo(e.target.value)}
                    placeholder="11 haneli kimlik no"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Çalışacağı Firma / Yer *</label>
                  <div className="relative">
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => handleSelectCompany(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none transition shadow-sm cursor-pointer pr-8"
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
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {selectedCompanyObj && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-950">İstenen Tetkikler: </span>
                      <span className="text-amber-900 font-medium">
                        {selectedCompanyObj.tests?.length ? selectedCompanyObj.tests.join(" • ") : "Standart Tetkikler"}
                      </span>
                    </div>
                  </div>
                  {selectedCompanyObj.recommended_price > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-slate-500">Tavsiye Edilen: </span>
                      <strong className="text-emerald-700 font-black text-sm">₺{selectedCompanyObj.recommended_price}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ödeme Alınma Biçimi *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none transition shadow-sm"
                  >
                    <option value="nakit">💵 Nakit</option>
                    <option value="pos">💳 POS / Kredi Kartı</option>
                    <option value="cari">📑 Cari (Firma Hesabı)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahsil Edilecek Tutar (TL)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ek Not (Varsa)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Fatura istendi, tahlil sonuçları teslim edildi vb."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none transition shadow-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Gönderiliyor..." : "Kaydet ve Alt Kata Sevk Et"}</span>
                </button>

                {altKatBekleyenler.length > 0 && (
                  <span className="text-xs text-slate-500">
                    Alt katta sırada bekleyen: <strong className="text-blue-600">{altKatBekleyenler.length} kişi</strong>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* ALT KATTA SIRASI DEVAM EDENLER */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Alt Katta Tetkiki Devam Eden Hastalar ({altKatBekleyenler.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">(Hatalı girişleri buradan düzeltebilirsiniz)</span>
            </div>

            {altKatBekleyenler.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                Alt katta şu anda sırada bekleyen hasta yok.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {altKatBekleyenler.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.patient_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.tc_no} • {item.company_name}</div>
                      <div className="text-[11px] text-slate-600 font-medium">₺{item.amount} • {item.payment_method.toUpperCase()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.patient_name)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* DÜZENLEME MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-emerald-600" />
                <span>Hasta Bilgilerini Düzenle</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={editPatientName}
                  onChange={(e) => setEditPatientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    value={editTcNo}
                    onChange={(e) => setEditTcNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Firma / Çalışacağı Yer</label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ödeme Türü</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="nakit">Nakit</option>
                    <option value="pos">POS / Kredi Kartı</option>
                    <option value="cari">Cari</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tutar (TL)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ek Not</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}