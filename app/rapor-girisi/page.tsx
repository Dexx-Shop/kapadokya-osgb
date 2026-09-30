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
  Building2, 
  UserCheck,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  AlertCircle
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

  // Canlı Kayıtlar
  const [reports, setReports] = useState<HealthReport[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Bugünün tarih saatini varsayılan yap
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
      .order("report_date", { ascending: false })
      .limit(30);

    setReports(data || []);
  }

  // SUPABASE REALTIME CANLI DİNLEME (F5 İHTİYACINI KALDIRIR)
  useEffect(() => {
    const channel = supabase
      .channel("health_reports_white_realtime")
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
        status: "bekliyor", // ALT KATA SEVK EDİLDİ
        report_date: new Date().toISOString(),
        created_by_name: userName,
        created_by_role: userRole,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: "Hata: " + error.message });
    } else {
      setMessage({ type: "success", text: `${patientName} alt kata sevk edildi ve sıraya alındı!` });
      setPatientName("");
      setTcNo("");
      setCompanyName("");
      setAmount("");
      setNotes("");
    }
  }

  // Alt Kat Tetkiki Bitirir (Muhasebeye Gönderir)
  async function handleAltKatComplete(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "alt_kat_tamamlandi" })
      .eq("id", reportId);
  }

  // Muhasebe Kontrol Eder ve Kesinleştirir
  async function handleMuhasebeFinalize(reportId: string) {
    await supabase
      .from("health_reports")
      .update({ status: "tamamlandi" })
      .eq("id", reportId);
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
  const sonRaporlar = reports.filter((r) => r.status === "tamamlandi");

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
            Rapor almaya gelen kişinin kimlik, firma ve tahsilat bilgilerini giriniz.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* EĞER ALT KATTAN GELEN KONTROL BEKLEYEN HASTA VARSA (MUHASEBE & ADMIN GÖRÜR) */}
        {/* ========================================================================= */}
        {(userRole === "muhasebe" || userRole === "admin") && muhasebeKontrolBekleyenler.length > 0 && (
          <div className="rounded-3xl bg-amber-50/80 border border-amber-200 p-6 shadow-sm animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-amber-600 animate-bounce" />
                <h3 className="text-sm font-bold text-amber-900">
                  Alt Kattan Tetkiki Bitenler (Kontrol & Onay Bekliyor)
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
                {muhasebeKontrolBekleyenler.length} Kişi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {muhasebeKontrolBekleyenler.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.patient_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.tc_no} • {item.company_name}</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">₺{item.amount} ({item.payment_method.toUpperCase()})</div>
                  </div>
                  <button
                    onClick={() => handleMuhasebeFinalize(item.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Check className="h-4 w-4" />
                    <span>Kontrol Edildi</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. MUHASEBE & ADMIN: YENİ HASTA KAYIT FORMU */}
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

        {/* ========================================================================= */}
        {/* 2. ALT KAT İSTASYONU EKRANI (ALT KAT & ADMIN GÖRÜR) */}
        {/* ========================================================================= */}
        {(userRole === "alt_kat" || userRole === "admin") && (
          <div className="rounded-3xl bg-white border border-blue-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Alt Kat İşlem Sırası</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Sırada Bekleyen Hastalar</h2>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {altKatBekleyenler.length} Hasta Bekliyor
              </span>
            </div>

            {altKatBekleyenler.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
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
        {/* 3. SON GİRİLEN SAĞLIK RAPORLARI TABLOSU (ORİJİNAL TEMİZ BEYAZ TABLO) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Son Girilen Sağlık Raporları</h3>
            <span className="text-xs text-slate-500 font-medium">Toplam {sonRaporlar.length} Kayıt</span>
          </div>

          {sonRaporlar.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Henüz tamamlanmış bir sağlık raporu kaydı bulunmuyor.
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
                  {sonRaporlar.map((r) => (
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

      </div>
    </div>
  );
}