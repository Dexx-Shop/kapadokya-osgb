"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  UserCheck,
  Check,
  FileSpreadsheet,
  Edit2,
  Trash2,
  X,
  ArrowUpCircle,
  Save,
  AlertTriangle,
  Stethoscope,
  ChevronDown
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

export default function RaporGirisiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Firmalar Listesi
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [customCompanyName, setCustomCompanyName] = useState<string>("");

  // Form State'leri (Muhasebe)
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Düzenleme Modali State'leri (Muhasebe Hasta Düzenleme)
  const [editingItem, setEditingItem] = useState<HealthReport | null>(null);
  const [editPatientName, setEditPatientName] = useState("");
  const [editTcNo, setEditTcNo] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Alt Kat Uyarı Onay Modali (Eksik Test Uyarısı)
  const [missingTestsModal, setMissingTestsModal] = useState<{
    reportId: string;
    patientName: string;
    missing: string[];
  } | null>(null);

  // Canlı Raporlar Listesi
  const [reports, setReports] = useState<HealthReport[]>([]);

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

      if (isSuperAdminEmail(user.email)) {
        setUserRole("admin");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, staff_role")
          .eq("id", user.id)
          .single();

        if (profile?.staff_role) {
          setUserRole(profile.staff_role);
        } else if (profile?.role === "admin") {
          setUserRole("admin");
        } else {
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
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });
    setCompanies(data || []);
  }

  async function fetchReports() {
    const { data } = await supabase
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false });
    setReports(data || []);
  }

  // SUPABASE REALTIME CANLI DİNLEME
  useEffect(() => {
    const reportsChannel = supabase
      .channel("health_reports_clean_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "health_reports" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as HealthReport;
            setReports((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
            playNotificationSound();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as HealthReport;
            setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          } else if (payload.eventType === "DELETE") {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const companiesChannel = supabase
      .channel("companies_clean_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "companies" },
        () => {
          fetchCompanies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(companiesChannel);
    };
  }, [supabase]);

  function playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {}
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
        created_by_role: userRole,
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

  async function handleToggleTest(reportId: string, testName: string, currentCompleted: string[] = []) {
    let updated: string[] = [];
    if (currentCompleted.includes(testName)) {
      updated = currentCompleted.filter((t) => t !== testName);
    } else {
      updated = [...currentCompleted, testName];
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, completed_tests: updated } : r))
    );

    await supabase
      .from("health_reports")
      .update({ completed_tests: updated })
      .eq("id", reportId);
  }

  function handleCheckAndCompleteAltKat(report: HealthReport) {
    const required = report.required_tests || [];
    const completed = report.completed_tests || [];
    const missing = required.filter((t) => !completed.includes(t));

    if (missing.length > 0) {
      setMissingTestsModal({
        reportId: report.id,
        patientName: report.patient_name,
        missing: missing,
      });
      return;
    }

    finalizeAltKatSend(report.id);
  }

  async function finalizeAltKatSend(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "alt_kat_tamamlandi" })
      .eq("id", reportId);

    setMissingTestsModal(null);
  }

  async function handleMuhasebeFinalize(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "tamamlandi" })
      .eq("id", reportId);
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

    if (error) {
      alert("Hata: " + error.message);
    } else {
      setEditingItem(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs">
        Yükleniyor...
      </div>
    );
  }

  const altKatBekleyenler = reports.filter((r) => r.status === "bekliyor");
  const muhasebeKontrolBekleyenler = reports.filter((r) => r.status === "alt_kat_tamamlandi");
  const sonKesinlesenRaporlar = reports.filter((r) => r.status === "tamamlandi");

  const terminalTitle = 
    userRole === "muhasebe" 
      ? "Muhasebe & Hasta Giriş Masası" 
      : userRole === "alt_kat" 
        ? "Alt Kat Tetkik İstasyonu" 
        : "Süper Yönetici";

  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ÜST BİLGİ KARTI */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Giriş Yapan Terminal: {terminalTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sağlık Raporu Kayıt Portalı
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {userRole === "alt_kat" 
              ? "Alt kata sevk edilen hastaların tetkiklerini tamamlayıp yukarıya gönderin."
              : "Hasta bilgilerini girip firmaya göre testleri ve ücreti belirleyerek alt kata sevk ediniz."}
          </p>
        </div>

        {/* 1. MUHASEBE: ALT KATTAN GELEN KONTROL BEKLEYEN HASTALAR */}
        {(userRole === "muhasebe" || userRole === "admin") && (
          <div className="rounded-3xl bg-amber-50/80 border border-amber-200 p-6 shadow-sm space-y-3">
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

            {muhasebeKontrolBekleyenler.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500 italic">
                Şu anda alt kattan dönen bekleyen bir hasta yok.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {muhasebeKontrolBekleyenler.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900">{item.patient_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.tc_no} • {item.company_name}</div>
                      <div className="text-xs font-bold text-emerald-600">₺{item.amount} ({item.payment_method.toUpperCase()})</div>
                      
                      {item.completed_tests && item.completed_tests.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Tamamlanan: {item.completed_tests.join(", ")}
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
            )}
          </div>
        )}

        {/* 2. MUHASEBE: YENİ HASTA KAYIT FORMU */}
        {(userRole === "muhasebe" || userRole === "admin") && (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileSpreadsheet className="h-5 w-5 text-[#d84315]" />
              <h2 className="text-base font-bold text-slate-900">Yeni Hasta / Kişi Kaydı</h2>
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                  />
                </div>

                {/* ANLAŞMALI FİRMA SEÇİMİ (AÇILIR LİSTE) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Çalışacağı Firma / Yer *</label>
                  <div className="relative">
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => handleSelectCompany(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#d84315] focus:outline-none transition shadow-sm cursor-pointer pr-8"
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
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-[#d84315] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* FİRMA BİLGİ ROZETİ (TAVSİYE EDİLEN FİYAT & TESTLER) */}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ödeme Alınma Biçimi *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                  >
                    <option value="nakit">💵 Nakit</option>
                    <option value="pos">💳 POS / Kredi Kartı</option>
                    <option value="cari">📑 Cari (Firma Hesabı)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tahsil Edilecek Tutar (TL)
                    {selectedCompanyObj?.recommended_price ? (
                      <span className="text-[10px] text-emerald-600 font-normal ml-1">
                        (Tavsiye: ₺{selectedCompanyObj.recommended_price})
                      </span>
                    ) : null}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kayıt Tarihi ve Saati</label>
                  <input
                    type="text"
                    disabled
                    value={reportDate}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed shadow-sm"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d84315] hover:bg-[#bf360c] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#d84315]/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Gönderiliyor..." : "Kaydet ve Alt Kata Sevk Et"}</span>
                </button>

                {altKatBekleyenler.length > 0 && (
                  <span className="text-xs text-slate-500">
                    Alt katta şu an sırada bekleyen: <strong className="text-blue-600">{altKatBekleyenler.length} kişi</strong>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 3. MUHASEBE: ALT KATTA BEKLEYENLERİ DÜZENLEME & SİLME */}
        {(userRole === "muhasebe" || userRole === "admin") && (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Alt Katta Tetkiki Devam Eden Hastalar ({altKatBekleyenler.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                (Yanlış bilgi varsa henüz alt kattayken buradan düzeltebilirsiniz)
              </span>
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
        )}

        {/* 4. ALT KAT: SIRADA BEKLEYENLER & TETKİK KONTROL LİSTESİ */}
        {(userRole === "alt_kat" || userRole === "admin") && (
          <div className="rounded-3xl bg-white border border-blue-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">ALT KAT İŞLEM SIRASI</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Sırada Bekleyen Hastalar & Tetkik Kontrol Listesi</h2>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {altKatBekleyenler.length} Hasta Bekliyor
              </span>
            </div>

            {altKatBekleyenler.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Şu anda alt katta işlem bekleyen hasta bulunmuyor. Muhasebeden yeni kayıt açıldığında anında buraya düşecektir.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {altKatBekleyenler.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between space-y-4 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(item.report_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Sırada</span>
                      </div>
                      
                      <div>
                        <div className="text-base font-bold text-slate-900">{item.patient_name}</div>
                        <div className="text-xs font-mono text-slate-500">{item.tc_no}</div>
                        <div className="text-xs text-slate-700 mt-0.5">Firma: <strong>{item.company_name}</strong></div>
                      </div>

                      {item.notes && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                          Not: {item.notes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-blue-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Yapılacak Tetkikler:
                        </span>
                        
                        {item.required_tests && item.required_tests.length > 0 ? (
                          item.required_tests.map((testName, i) => {
                            const isDone = item.completed_tests?.includes(testName);
                            return (
                              <label
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                                  isDone
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleTest(item.id, testName, item.completed_tests)}
                                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span>{testName}</span>
                              </label>
                            );
                          })
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">Tanımlı tetkik yok (Genel)</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckAndCompleteAltKat(item)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check className="h-4 w-4" />
                      <span>İşlem Tamamlandı (Yukarıya Sevk)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. GİZLİLİK KALKANI: SADECE ADMİN'E GÖRÜNEN RAPOR ARŞİVİ */}
        {userRole === "admin" && (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Yönetici Özel Arşivi</span>
                <h3 className="text-base font-bold text-slate-900">Son Girilen Sağlık Raporları</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Toplam {sonKesinlesenRaporlar.length} Kayıt</span>
            </div>

            {sonKesinlesenRaporlar.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Henüz kesinleşmiş bir sağlık raporu kaydı bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[11px]">
                      <th className="py-3 px-3">Tarih</th>
                      <th className="py-3 px-3">Kişi</th>
                      <th className="py-3 px-3">Firma</th>
                      <th className="py-3 px-3">Ödeme</th>
                      <th className="py-3 px-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {sonKesinlesenRaporlar.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(r.report_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}{" "}
                          {new Date(r.report_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{r.patient_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.tc_no}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{r.company_name}</td>
                        <td className="py-3 px-3 uppercase font-bold text-[11px] text-slate-800">
                          {r.payment_method === "nakit" && "NAKİT"}
                          {r.payment_method === "pos" && "POS"}
                          {r.payment_method === "cari" && "CARİ"}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          ₺{Number(r.amount).toLocaleString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ALT KAT: EKSİK TEST UYARI ONAY PENCERESİ */}
      {missingTestsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-amber-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-2xl bg-amber-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">İşaretlenmemiş Testler Var!</h3>
                <p className="text-xs text-slate-500">{missingTestsModal.patientName} için eksik testler:</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              {missingTestsModal.missing.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-bold">
                  <span>•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bu testleri yapmadınız veya işaretlemediniz. Yine de hastayı muhasebeye göndermek istediğinize emin misiniz?
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMissingTestsModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Geri Dön (Testi Yap)
              </button>
              <button
                type="button"
                onClick={() => finalizeAltKatSend(missingTestsModal.reportId)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
              >
                Evet, Yine de Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MUHASEBE HASTA DÜZENLEME MODAL PENCERESİ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-[#d84315]" />
                <span>Hasta Bilgilerini Düzenle</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Firma / Çalışacağı Yer</label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ödeme Türü</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ek Not</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:border-[#d84315] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d84315] hover:bg-[#bf360c] text-white font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
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