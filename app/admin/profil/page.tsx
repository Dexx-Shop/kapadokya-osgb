"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  UserCog, 
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
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          <span>Yönetim Konsolu Yetkisi</span>
        </div>
        <h1 className="text-2xl font-black text-white">Yönetici Profil & Güvenlik</h1>
        <p className="text-xs text-slate-400 mt-1">
          Yönetici adınızı, hesap erişim detaylarınızı ve panel giriş şifrenizi buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KİŞİSEL BİLGİLER */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCog className="h-4 w-4 text-purple-400" />
            <span>Yönetici Bilgileri</span>
          </h2>

          {infoMsg && (
            <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold border ${
              infoMsg.type === "success" 
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                : "bg-rose-500/10 text-rose-300 border-rose-500/30"
            }`}>
              {infoMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{infoMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Yönetici Adı Soyadı</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-xs text-white focus:border-purple-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Kayıtlı E-posta (Değiştirilemez)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 px-3.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={savingInfo}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Bilgileri Güncelle</span>}
            </button>
          </form>
        </div>

        {/* ŞİFRE DEĞİŞTİRME */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-400" />
            <span>Şifre Yenileme</span>
          </h2>

          {passMsg && (
            <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold border ${
              passMsg.type === "success" 
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                : "bg-rose-500/10 text-rose-300 border-rose-500/30"
            }`}>
              {passMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Yeni Yönetici Şifresi</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="En az 6 karakter"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
              />
            </div>

            <div className="pt-7">
              <button
                type="submit"
                disabled={savingPass}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-6 py-2.5 text-xs font-bold text-white border border-white/10 transition active:scale-95 disabled:opacity-50 cursor-pointer"
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