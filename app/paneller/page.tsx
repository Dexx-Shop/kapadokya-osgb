"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Calculator, 
  Stethoscope, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Crown,
  ArrowLeft,
  LogOut,
  UserCheck
} from "lucide-react";

export default function PanelSecimPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>(""); // 'admin' | 'muhasebe' | 'alt_kat'
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
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

        if (profile?.role === "admin") {
          setUserRole("admin");
        } else if (profile?.staff_role) {
          setUserRole(profile.staff_role);
        } else {
          router.push("/");
          return;
        }
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#07090e] flex flex-col items-center justify-center text-white">
        <Sparkles className="h-8 w-8 animate-spin text-amber-400 mb-3" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Yükleniyor...
        </span>
      </div>
    );
  }

  const isAdmin = userRole === "admin";
  const isMuhasebe = userRole === "muhasebe" || isAdmin;
  const isUzman = userRole === "alt_kat" || isAdmin;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 overflow-y-auto selection:bg-amber-500 selection:text-white flex flex-col justify-between">
      
      {/* ARKA PLAN IŞIK HÜZMELERİ */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* ÜST MİNİ BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold transition active:scale-95 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Siteye Dön</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px]">{currentUser?.user_metadata?.full_name || currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Oturumu Kapat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* İÇERİK MERKEZİ */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 my-auto space-y-12 relative z-10">
        
        {/* ÜST BAŞLIK */}
        <div className="text-center space-y-3 animate-in fade-in duration-500">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Çalışma Alanınızı Seçin
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Giriş yapmak istediğiniz paneli seçiniz.
          </p>
        </div>

        {/* 3 MİNİMALİST KART */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* 1. YÖNETİM PANELİ */}
          <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-8 border backdrop-blur-2xl text-center items-center ${
            isAdmin 
              ? "bg-gradient-to-b from-amber-500/[0.08] to-slate-900/60 border-amber-500/30 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5" 
              : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
          }`}>
            <div className="space-y-5 flex flex-col items-center w-full">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Crown className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                  Yönetim Paneli
                </h3>
              </div>
            </div>

            <div className="pt-8 w-full">
              {isAdmin ? (
                <Link
                  href="/yonetici-odasi"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Yetkiniz Yok</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. MUHASEBE PANELİ */}
          <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-8 border backdrop-blur-2xl text-center items-center ${
            isMuhasebe 
              ? "bg-gradient-to-b from-emerald-500/[0.08] to-slate-900/60 border-emerald-500/30 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5" 
              : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
          }`}>
            <div className="space-y-5 flex flex-col items-center w-full">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Calculator className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  Muhasebe Paneli
                </h3>
              </div>
            </div>

            <div className="pt-8 w-full">
              {isMuhasebe ? (
                <Link
                  href="/muhasebe"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Yetkiniz Yok</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. UZMAN PANELİ */}
          <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-8 border backdrop-blur-2xl text-center items-center ${
            isUzman 
              ? "bg-gradient-to-b from-blue-500/[0.08] to-slate-900/60 border-blue-500/30 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5" 
              : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
          }`}>
            <div className="space-y-5 flex flex-col items-center w-full">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                  Uzman Paneli
                </h3>
              </div>
            </div>

            <div className="pt-8 w-full">
              {isUzman ? (
                <Link
                  href="/uzman"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Yetkiniz Yok</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ALT BOŞLUK */}
      <div className="p-4" />
    </div>
  );
}