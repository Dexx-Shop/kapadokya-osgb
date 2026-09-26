"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  UserCog, 
  Lock, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  KeyRound 
} from "lucide-react";

export default function AdminProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
      }
    }
    load();
  }, [supabase]);

  // Bilgileri Güncelle
  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      setInfoMsg({ type: "error", text: error.message });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      }
      setInfoMsg({ type: "success", text: "Yönetici bilgileriniz başarıyla güncellendi." });
    }
    setSavingInfo(false);
  }

  // Şifre Güncelle
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMsg({ type: "error", text: "Şifreniz en az 6 karakter olmalıdır." });
      return;
    }

    setSavingPass(true);
    setPassMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setPassMsg({ type: "error", text: error.message });
    } else {
      setPassMsg({ type: "success", text: "Yönetici şifreniz başarıyla yenilendi." });
      setNewPassword("");
    }
    setSavingPass(false);
  }

  return (
    <div className="space-y-6">
      
      {/* Üst Kart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-800 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          <span>Yönetim Konsolu Yetkisi</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Yönetici Profil & Güvenlik</h1>
        <p className="text-xs text-slate-500 mt-1">
          Yönetici adınızı, hesap erişim detaylarınızı ve panel giriş şifrenizi buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KİŞİSEL BİLGİLER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <UserCog className="h-4 w-4 text-[#d84315]" />
            <span>Yönetici Bilgileri</span>
          </h2>

          {infoMsg && (
            <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              infoMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {infoMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{infoMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Yönetici Adı Soyadı</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-[#d84315] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Kayıtlı E-posta (Değiştirilemez)</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={savingInfo}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d84315] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Bilgileri Güncelle</span>}
            </button>
          </form>
        </div>

        {/* ŞİFRE DEĞİŞTİRME */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <KeyRound className="h-4 w-4 text-[#d84315]" />
            <span>Şifre Yenileme</span>
          </h2>

          {passMsg && (
            <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              passMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {passMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Yeni Yönetici Şifresi</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="En az 6 karakter"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-[#d84315] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="pt-7">
              <button
                type="submit"
                disabled={savingPass}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {savingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Şifreyi Değiştir</span>}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}