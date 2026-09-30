"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  ArrowLeft, 
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
  Save
} from "lucide-react";

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
}

export default function RaporGirisiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>(""); // 'muhasebe' | 'alt_kat' | 'admin'
  const [loading, setLoading] = useState(true);

  // Form State'leri
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Düzenleme Modali State'leri (Muhasebe için)
  const [editingItem, setEditingItem] = useState<HealthReport | null>(null);
  const [editPatientName, setEditPatientName] = useState("");
  const [editTcNo, setEditTcNo] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Canlı Kayıtlar
  const [reports, setReports] = useState<HealthReport[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    setReportDate(formatted);

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

      fetchReports();
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function fetchReports() {
    const { data } = await supabase
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false });

    setReports(data || []);
  }

  // SUPABASE REALTIME CANLI DİNLEME
  useEffect(() => {
    const channel = supabase
      .channel("health_reports_live_stream")
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
            playNotificationSound();
          } else if (payload.eventType === "DELETE") {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  // Muhasebe Müşteriyi Kaydeder ve Alt Kata Sevk Eder
  async function handleSendToAltKat(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim() || !tcNo.trim() || !companyName.trim()) {
      setMessage({ type: "error", text: "Lütfen ad soyad, TC kimlik ve firma alanlarını doldurun." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const userName = currentUser.user_metadata?.full_name || currentUser.email;

    const { error } = await supabase.from("health_reports").insert([
      {
        patient_name: patientName.trim(),
        tc_no: tcNo.trim(),
        company_name: companyName.trim(),
        payment_method: paymentMethod,
        amount: Number(amount) || 0,
        notes: notes.trim(),
        status: "bekliyor", // Alt kata gitti
        report_date: new Date().toISOString(),
        created_by_name: userName,
        created_by_role: userRole,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Hata: " + error.message });
    } else {
      setMessage({ type: "success", text: `${patientName} alt kata sevk edildi!` });
      setPatientName("");
      setTcNo("");
      setCompanyName("");
      setAmount("");
      setNotes("");
    }
  }

  // Alt Kat Tetkiki Bitirir (Muhasebeye Yollar)
  async function handleAltKatComplete(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "alt_kat_tamamlandi" })
      .eq("id", reportId);
  }

  // Muhasebe Kontrol Eder ve Kesinleştirir (Artık personeller göremez, sadece admin görür)
  async function handleMuhasebeFinalize(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "tamamlandi" })
      .eq("id", reportId);
  }

  // Muhasebe Henüz Kontrol Edilmemiş Kaydı Siler
  async function handleDelete(reportId: string, name: string) {
    if (!confirm(`${name} isimli hastanın kaydını silmek istediğinize emin misiniz?`)) return;
    await supabase.from("health_reports").delete().eq("id", reportId);
  }

  // Düzenleme Modali Aç
  function openEditModal(item: HealthReport) {
    setEditingItem(item);
    setEditPatientName(item.patient_name);
    setEditTcNo(item.tc_no);
    setEditCompanyName(item.company_name);
    setEditPaymentMethod(item.payment_method);
    setEditAmount(item.amount.toString());
    setEditNotes(item.notes || "");
  }

  // Düzenlemeyi Kaydet
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ÜST BİLGİ KARTI */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Giriş Yapan Terminal: {terminalTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sağlık Raporu Kayıt Portalı
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {userRole === "alt_kat" 
              ? "Muhasebeden alt kata sevk edilen hastaları görüntüleyin ve işlemleri tamamlayın."
              : "Rapor almaya gelen kişinin kimlik, firma ve tahsilat bilgilerini giriniz."}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. MUHASEBE & ADMIN: ALT KATTAN GELEN KONTROL BEKLEYEN HASTALAR */}
        {/* ========================================================================= */}
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
                      {item.notes && <div className="text-[11px] text-slate-400">Not: {item.notes}</div>}
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <button
                        onClick={() => handleMuhasebeFinalize(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Onayla ve Şirket Raporlarına Kaydet"
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
                          title="Kaydı Sil"
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

        {/* ========================================================================= */}
        {/* 2. MUHASEBE & ADMIN: YENİ HASTA KAYIT FORMU */}
        {/* ========================================================================= */}
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Çalışacağı Yer / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Örn: Votorantim Çimento veya Şahıs"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                  />
                </div>
              </div>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahsil Edilen Tutar (TL)</label>
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d84315] hover:bg-[#bf360c] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#d84315]/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Gönderiliyor..." : "Kaydet ve Alt Kata Sevk Et"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MUHASEBE: ALT KATTA SIRADA BEKLEYENLERİ İZLEME & DÜZELTME ALANI */}
        {/* ========================================================================= */}
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

        {/* ========================================================================= */}
        {/* 4. ALT KAT İSTASYONU EKRANI (ALT KAT & ADMIN GÖRÜR - DÜZENLEME BUTONU YOK) */}
        {/* ========================================================================= */}
        {(userRole === "alt_kat" || userRole === "admin") && (
          <div className="rounded-3xl bg-white border border-blue-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">ALT KAT İŞLEM SIRASI</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Sırada Bekleyen Hastalar</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {altKatBekleyenler.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>{new Date(item.report_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="font-bold text-blue-600">Sırada</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{item.patient_name}</div>
                      <div className="text-xs font-mono text-slate-500">{item.tc_no}</div>
                      <div className="text-xs text-slate-700 mt-1">Firma: <strong>{item.company_name}</strong></div>
                      {item.notes && <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg mt-1.5 border border-amber-200">Not: {item.notes}</div>}
                    </div>

                    {/* Alt Kat Sadece İşlemi Bitirebilir (DÜZENLEME YETKİSİ YOKTUR) */}
                    <button
                      onClick={() => handleAltKatComplete(item.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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

        {/* ========================================================================= */}
        {/* 5. GİZLİLİK KALKANI: SON GİRİLEN SAĞLIK RAPORLARI */}
        {/* BU BÖLÜM SADECE EN ÜST YÖNETİCİYE (ADMIN) GÖRÜNÜR! MUHASEBE VE ALT KAT GÖREMEZ */}
        {/* ========================================================================= */}
        {/* {userRole === "admin" && (
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
        )} */}

      </div>

      {/* ========================================================================= */}
      {/* MUHASEBE İÇİN CANLI DÜZENLEME MODAL PENCERESİ */}
      {/* ========================================================================= */}
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