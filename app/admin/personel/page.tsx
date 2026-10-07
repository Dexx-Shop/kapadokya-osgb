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

  async function handleRevokeRole(id: string, email: string) {
    if (!confirm(`${email} hesabının personel yetkisini kaldırmak istediğinize emin misiniz?`)) return;

    const { error } = await supabase.rpc("revoke_staff_role", { target_id: id });
    if (!error) {
      setMessage({ type: "success", text: `${email} personelinin yetkisi iptal edildi.` });
      await loadStaff();
    }
  }

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
      <div className="bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          <span>Sistem Güvenlik & İzin Yönetimi</span>
        </div>
        <h1 className="text-2xl font-black text-white">Personel Yetkilendirme & Rol Yönetimi</h1>
        <p className="text-xs text-slate-400 mt-1">
          Muhasebe veya Uzman (Alt Kat) panellerine giriş yapabilecek personellerin e-postalarını yetkilendirin.
        </p>
      </div>

      {/* Yetki Verme Formu */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-purple-400" />
          <span>Yeni Personel Yetkisi Tanımla</span>
        </h2>

        {message && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold border ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Personelin Kayıtlı E-Postası</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="personel@kapadokyaosgb.com"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Verilecek Yetki Rolü</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "muhasebe" | "alt_kat")}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-purple-400 focus:outline-none transition cursor-pointer"
            >
              <option value="muhasebe">Muhasebe Paneli (Hasta Sevk & Kasa)</option>
              <option value="alt_kat">Uzman Paneli (Alt Kat Tetkik & Muayene)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Yetkiyi Ata</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Yetkili Personel Listesi */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          <span>Sistemde Yetkisi Bulunan Personeller ({profiles.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Kayıtlı yetkili personel bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase font-bold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Personel / İsim</th>
                  <th className="py-3 px-4">E-Posta</th>
                  <th className="py-3 px-4">Rolü</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((p) => {
                  const isOwner = p.role === "admin" || p.email === "eymenulugercek@gmail.com";
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {p.full_name || "İsimsiz Kullanıcı"}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{p.email}</td>
                      <td className="py-3 px-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 text-[11px] font-black">
                            Süper Admin
                          </span>
                        ) : p.staff_role === "muhasebe" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold">
                            <Building className="h-3 w-3" />
                            Muhasebe
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-1 text-[11px] font-bold">
                            <Computer className="h-3 w-3" />
                            Uzman (Alt Kat)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          p.is_active 
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                            : "bg-rose-500/10 text-rose-300 border-rose-500/30"
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
                                  ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/20" 
                                  : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                            >
                              <PowerOff className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRevokeRole(p.id, p.email)}
                              title="Yetkiyi Tamamen Kaldır"
                              className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
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