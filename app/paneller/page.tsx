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
  UserCheck,
  LayoutDashboard
} from "lucide-react";

export default function PanelSecimPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
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
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 overflow-hidden flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* ARKA PLAN IŞIK HÜZMELERİ (TAŞMAYI ÖNLEMEK İÇİN OVERFLOW-HIDDEN İÇİNDE KALIR) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ÜST MİNİ BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 px-6 py-3.5 flex items-center justify-between shrink-0">
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

      {/* İÇERİK MERKEZİ (TAM ORTALANMIŞ VE SCROLLBAR'SIZ) */}
      <main className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl w-full mx-auto space-y-8 sm:space-y-10 my-auto">
          
          {/* ÜST BAŞLIK */}
          <div className="text-center space-y-2.5 animate-in fade-in duration-500">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Çalışma Alanınızı Seçin
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Giriş yapmak istediğiniz kurumsal yönetim istasyonunu seçiniz.
            </p>
          </div>

          {/* 4 MİNİMALİST KART */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            
            {/* 1. ÜST YÖNETİM PANELİ */}
            <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 border backdrop-blur-2xl text-center items-center ${
              isAdmin 
                ? "bg-gradient-to-b from-amber-500/[0.08] to-slate-900/60 border-amber-500/30 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5" 
                : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
            }`}>
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Üst Yönetim
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Ciro, Kasa & Resmi Portallar</p>
                </div>
              </div>

              <div className="pt-6 w-full">
                {isAdmin ? (
                  <Link
                    href="/yonetici-odasi"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Yetkiniz Yok</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. MÜDÜR PANELİ */}
            <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 border backdrop-blur-2xl text-center items-center ${
              isAdmin 
                ? "bg-gradient-to-b from-purple-500/[0.08] to-slate-900/60 border-purple-500/30 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5" 
                : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
            }`}>
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                    Müdür Paneli
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Personel, Galeri & Firma Ayarları</p>
                </div>
              </div>

              <div className="pt-6 w-full">
                {isAdmin ? (
                  <Link
                    href="/admin/personel"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Yetkiniz Yok</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. MUHASEBE PANELİ */}
            <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 border backdrop-blur-2xl text-center items-center ${
              isMuhasebe 
                ? "bg-gradient-to-b from-emerald-500/[0.08] to-slate-900/60 border-emerald-500/30 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5" 
                : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
            }`}>
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                    Muhasebe Paneli
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Hasta Sevk & Ödeme Kontrol</p>
                </div>
              </div>

              <div className="pt-6 w-full">
                {isMuhasebe ? (
                  <Link
                    href="/muhasebe"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Yetkiniz Yok</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. UZMAN PANELİ */}
            <div className={`relative group rounded-3xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 border backdrop-blur-2xl text-center items-center ${
              isUzman 
                ? "bg-gradient-to-b from-blue-500/[0.08] to-slate-900/60 border-blue-500/30 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5" 
                : "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
            }`}>
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition-colors">
                    Uzman Paneli
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Tetkik Onay & Test Rehberi</p>
                </div>
              </div>

              <div className="pt-6 w-full">
                {isUzman ? (
                  <Link
                    href="/uzman"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Yetkiniz Yok</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ALT BOŞLUKSUZ BİTİŞ */}
      <footer className="py-2 text-center shrink-0">
        <span className="text-[10px] text-slate-600 tracking-wide font-medium">
          Kapadokya OSGB © Merkezi Yönetim Konsolu
        </span>
      </footer>

    </div>
  );
}