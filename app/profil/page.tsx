"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  KeyRound
} from "lucide-react";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/giris-yap");
        return;
      }

      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      setLoadingProfile(false);
    }

    loadUserData();
  }, [router, supabase]);

  // Bilgileri Güncelle (Ad Soyad)
  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      setInfoMessage({ type: "error", text: error.message });
    } else {
      // Profil tablosunda da güncelle
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      }
      setInfoMessage({ type: "success", text: "Bilgileriniz başarıyla güncellendi." });
      router.refresh();
    }
    setSavingInfo(false);
  }

  // Şifre Değiştir
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Şifreniz en az 6 karakter olmalıdır." });
      return;
    }

    setSavingPass(true);
    setPassMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setPassMessage({ type: "error", text: error.message });
    } else {
      setPassMessage({ type: "success", text: "Şifreniz başarıyla değiştirildi." });
      setNewPassword("");
    }
    setSavingPass(false);
  }

  if (loadingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#4482cf] via-[#75a8e5] to-[#cbe1fb]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-b from-[#4482cf] via-[#75a8e5] to-[#cbe1fb]">
      
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/60 bg-white/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Üst Başlık & Geri Dön */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Siteye Dön</span>
          </Link>

          <Link href="/">
            <Image
              src="/kapadokyalogo.png"
              alt="Kapadokya OSGB"
              width={180}
              height={50}
              className="h-10 w-auto object-contain drop-shadow"
            />
          </Link>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d84315]/10 px-3 py-1 text-xs font-bold text-[#d84315] mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Hesap Güvenliği & Ayarlar</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Profil Bilgileriniz</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kişisel bilgilerinizi ve portal erişim şifrenizi bu alandan güncelleyebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. KİŞİSEL BİLGİLER FORMU */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-[#d84315]" />
              <span>Kişisel Bilgiler</span>
            </h2>

            {infoMessage && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${infoMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {infoMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{infoMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Ad Soyad</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-[#d84315] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">E-posta (Değiştirilemez)</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingInfo}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d84315] py-2.5 text-xs font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Bilgileri Kaydet</span>}
              </button>
            </form>
          </div>

          {/* 2. ŞİFRE DEĞİŞTİRME FORMU */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <KeyRound className="h-4 w-4 text-[#d84315]" />
              <span>Şifre Değiştir</span>
            </h2>

            {passMessage && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${passMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {passMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Yeni Şifre</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="En az 6 karakter"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 shadow-sm focus:border-[#d84315] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-7">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                  {savingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Şifreyi Güncelle</span>}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </main>
  );
}