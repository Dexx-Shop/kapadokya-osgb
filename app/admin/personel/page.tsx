"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  PowerOff,
  Building,
  Computer
} from "lucide-react";

interface ProfileItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  staff_role: string;
  is_active: boolean;
}

export default function AdminStaffPage() {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"muhasebe" | "alt_kat">("muhasebe");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_all_staff");

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  }

  // Yeni Personel Yetkilendirme
  async function handleAssignRole(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    try {
      const { data, error } = await supabase.rpc("assign_staff_role", {
        target_email: cleanEmail,
        new_role: selectedRole,
      });

      if (error) throw error;

      if (!data.success) {
        setMessage({ type: "error", text: data.message });
      } else {
        setMessage({ 
          type: "success", 
          text: `${cleanEmail} adresine "${selectedRole === 'muhasebe' ? 'Muhasebe' : 'Alt Kat Bilgisayar'}" yetkisi tanımlandı!` 
        });
        setEmailInput("");
        await loadStaff();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: "error", text: error.message || "İşlem sırasında bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  }

  // Yetkiyi Kaldırma
  async function handleRevokeRole(id: string, email: string) {
    if (!confirm(`${email} hesabının personel yetkisini kaldırmak istediğinize emin misiniz?`)) return;

    const { error } = await supabase.rpc("revoke_staff_role", { target_id: id });
    if (!error) {
      setMessage({ type: "success", text: `${email} personelinin yetkisi iptal edildi.` });
      await loadStaff();
    }
  }

  // Hesabı Dondur / Aktif Et
  async function handleToggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase.rpc("toggle_staff_active", { 
      target_id: id, 
      new_status: !currentStatus 
    });

    if (!error) {
      await loadStaff();
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-800 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          <span>Sistem Güvenlik & Personel İzinleri</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sağlık Raporu Personel Yetkilendirme</h1>
        <p className="text-xs text-slate-500 mt-1">
          Muhasebe veya Alt Kat Bilgisayar için sisteme rapor girebilecek personelleri belirleyin. Yetkiyi sildiğiniz an sisteme erişimleri anında kesilir.
        </p>
      </div>

      {/* Yetki Verme Formu */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-[#d84315]" />
          <span>Yeni Personel Yetkisi Ata</span>
        </h2>

        {message && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">Personelin Kayıtlı E-Postası</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="eymenulu66@gmail.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#d84315] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Verilecek Yetki Rolü</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "muhasebe" | "alt_kat")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-[#d84315] focus:outline-none"
            >
              <option value="muhasebe">Muhasebe (Ana Kasa)</option>
              <option value="alt_kat">Alt Kat Bilgisayar (Yedek)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#d84315] py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-[#bf360c] transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Yetkiyi Tanımla</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Yetkili Personel Listesi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-600" />
          <span>Sistemde Yetkisi Bulunan Personeller ({profiles.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#d84315]" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Kayıtlı yetkili personel bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Personel / İsim</th>
                  <th className="py-3 px-4">E-Posta</th>
                  <th className="py-3 px-4">Rolü</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Yetki İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => {
                  const isOwner = p.role === "admin" || p.email === "eymenulugercek@gmail.com";
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.full_name || "İsimsiz Kullanıcı"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.email}</td>
                      <td className="py-3 px-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-amber-300 px-2.5 py-1 text-[11px] font-black">
                            Şirket Sahibi (Süper Admin)
                          </span>
                        ) : p.staff_role === "muhasebe" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 px-2.5 py-1 text-[11px] font-bold border border-blue-200">
                            <Building className="h-3 w-3" />
                            Muhasebe
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold border border-emerald-200">
                            <Computer className="h-3 w-3" />
                            Alt Kat Bilgisayar
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {p.is_active ? "Aktif" : "Erişim Engellendi"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isOwner && (
                          <>
                            <button
                              onClick={() => handleToggleActive(p.id, p.is_active)}
                              title={p.is_active ? "Erişimi Dondur" : "Erişimi Aç"}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                p.is_active 
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50" 
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              <PowerOff className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRevokeRole(p.id, p.email)}
                              title="Yetkiyi Tamamen Kaldır"
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}