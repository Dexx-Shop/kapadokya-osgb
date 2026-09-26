"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  X,
  UserCheck
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
}

export default function RaporGirisiPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Değişkenleri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 16));

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function verify() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/giris-yap");
        return;
      }

      // 1. KONTROL: Sabit listedeki Süper Admin ise doğrudan yetkili kıl
      if (isSuperAdminEmail(user.email)) {
        setCurrentUser({ ...user, full_name: user.user_metadata?.full_name || "Yönetici" });
        setUserRole("admin");
        loadReports();
        return;
      }

      // 2. KONTROL: Veritabanı Personel / Admin Kontrolü
      const { data: profile } = await supabase
        .from("profiles")
        .select("staff_role, role, is_active, full_name")
        .eq("id", user.id)
        .single();

      const hasAccess = 
        profile && 
        profile.is_active !== false && 
        (profile.role === "admin" || ["muhasebe", "alt_kat"].includes(profile.staff_role));

      if (!hasAccess) {
        router.push("/");
        return;
      }

      setCurrentUser({ ...user, full_name: profile.full_name || user.email });
      setUserRole(profile.role === "admin" ? "admin" : profile.staff_role);
      loadReports();
    }

    verify();
  }, [router, supabase]);

  async function loadReports() {
    setLoading(true);
    const { data } = await supabase
      .from("health_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(30);

    setReports(data || []);
    setLoading(false);
  }

  // Kaydet veya Güncelle
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        patient_name: patientName.trim(),
        tc_no: tcNo.trim(),
        company_name: companyName.trim(),
        payment_method: paymentMethod,
        amount: parseFloat(amount) || 0,
        notes: notes.trim(),
        report_date: new Date(reportDate).toISOString(),
        created_by: currentUser.id,
        created_by_name: currentUser.full_name || currentUser.email,
        created_by_email: currentUser.email,
        created_by_role: userRole,
      };

      if (editingId) {
        const { error } = await supabase
          .from("health_reports")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        setMessage({ type: "success", text: "Rapor kaydı başarıyla güncellendi!" });
      } else {
        const { error } = await supabase
          .from("health_reports")
          .insert([payload]);

        if (error) throw error;
        setMessage({ type: "success", text: "Yeni sağlık raporu kaydı sisteme işlendi!" });
      }

      resetForm();
      loadReports();
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: "error", text: error.message || "İşlem sırasında hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: ReportItem) {
    setEditingId(item.id);
    setPatientName(item.patient_name);
    setTcNo(item.tc_no);
    setCompanyName(item.company_name);
    setPaymentMethod(item.payment_method);
    setAmount(item.amount.toString());
    setNotes(item.notes || "");
    setReportDate(new Date(item.report_date).toISOString().slice(0, 16));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setPatientName("");
    setTcNo("");
    setCompanyName("");
    setPaymentMethod("nakit");
    setAmount("0");
    setNotes("");
    setReportDate(new Date().toISOString().slice(0, 16));
  }

  return (
    <main className="min-h-screen bg-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Üst Bilgi Kartı */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2 border border-blue-200">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Giriş Yapan Terminal: {userRole === "muhasebe" ? "Muhasebe (Ana Masa)" : userRole === "alt_kat" ? "Alt Kat Bilgisayar" : "Süper Yönetici"}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Sağlık Raporu Kayıt Portalı</h1>
            <p className="text-xs text-slate-500">
              Rapor almaya gelen kişinin kimlik, firma ve tahsilat bilgilerini giriniz.
            </p>
          </div>
        </div>

        {/* Kayıt / Düzenleme Formu */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#d84315]" />
              <span>{editingId ? "Rapor Kaydını Düzenle" : "Yeni Hasta / Kişi Kaydı"}</span>
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Düzenlemeyi İptal Et</span>
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kişinin Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">T.C. Kimlik No *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value)}
                  placeholder="11 haneli kimlik no"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Çalışacağı Yer / Firma Adı *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Votorantim Çimento veya Şahıs"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ödeme Alınma Biçimi *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "nakit" | "pos" | "cari")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
                >
                  <option value="nakit">💵 Nakit</option>
                  <option value="pos">💳 POS / Kredi Kartı</option>
                  <option value="cari">🏢 Çalıştığı Yere (Cari Hesap)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahsil Edilen Tutar (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kayıt Tarihi ve Saati</label>
                <input
                  type="datetime-local"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ek Not (Varsa)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Fatura istendi, tahlil sonuçları teslim edildi vb."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d84315] px-7 py-3 text-xs font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{editingId ? "Değişiklikleri Kaydet" : "Kayıt Yap ve Onayla"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Son Girilen Kayıtlar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Son Girilen Sağlık Raporları</h2>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#d84315]" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">Henüz bir kayıt girilmemiş.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Kişi</th>
                    <th className="py-2.5 px-3">Firma</th>
                    <th className="py-2.5 px-3">Ödeme</th>
                    <th className="py-2.5 px-3">Tutar</th>
                    <th className="py-2.5 px-3 text-right">Düzenle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-slate-600">
                        {new Date(item.report_date).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.patient_name} <span className="font-normal text-slate-400 block font-mono text-[10px]">{item.tc_no}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{item.company_name}</td>
                      <td className="py-2.5 px-3 font-semibold uppercase">{item.payment_method}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">₺{Number(item.amount).toLocaleString("tr-TR")}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
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
    </main>
  );
}