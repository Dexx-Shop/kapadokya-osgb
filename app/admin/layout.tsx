"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Images, 
  UserCog, 
  ShieldAlert, 
  ArrowLeft, 
  Menu, 
  X, 
  LogOut, 
  Users, 
  FileText, 
  Building2, 
  Sparkles,
  LayoutDashboard,
  UserCheck
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/giris-yap");
        return;
      }

      if (isSuperAdminEmail(user.email)) {
        setCurrentUser(user);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      setCurrentUser(user);
      setLoading(false);
    }

    checkAdmin();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090e] text-white gap-3">
        <Sparkles className="h-8 w-8 animate-spin text-purple-400" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Müdür Paneli Doğrulanıyor...</span>
      </div>
    );
  }

  const navItems = [
    {
      name: "Personel & Yetki Yönetimi",
      href: "/admin/personel",
      icon: Users,
      badge: "Roller"
    },
    {
      name: "Galeri Fotoğrafları",
      href: "/admin/galeri",
      icon: Images,
      badge: null
    },
    {
      name: "Anlaşmalı Firmalar",
      href: "/admin/firmalar",
      icon: Building2,
      badge: "Fiyat & Test"
    },
    {
      name: "Profil & Güvenlik",
      href: "/admin/profil",
      icon: UserCog,
      badge: "Yönetici"
    },
    {
      name: "İş Başvuruları (CV)",
      href: "/admin/basvurular",
      icon: FileText,
      badge: "Yakında",
      disabled: true
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 overflow-y-auto selection:bg-purple-500 selection:text-white flex flex-col">
      
      {/* ARKA PLAN IŞIK EFEKTLERİ */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ÜST MİNİ NAVİGASYON (GLOBAL NAVBAR TAMAMEN KALKTI) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/paneller"
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold transition active:scale-95 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Personel Portalı'na Dön</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <LayoutDashboard className="h-4 w-4 text-purple-400" />
            <span>Müdür & Operasyon Yönetim Konsolu</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
            <UserCheck className="h-3.5 w-3.5 text-purple-400" />
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

          {/* Mobil Menü Aç/Kapa Butonu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden cursor-pointer"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* İÇERİK MERKEZİ & SIDEBAR */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8 items-start relative z-10">
        
        {/* SOL: MÜDÜR PANELİ SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d111c] border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:rounded-3xl lg:border lg:bg-white/[0.03] lg:backdrop-blur-xl ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            
            {/* ÜST PROFİL ROZETİ */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">Süper Yönetici</div>
                <h2 className="text-sm font-black text-white truncate">Müdür Paneli</h2>
              </div>
            </div>

            {/* MENÜ BAĞLANTILARI */}
            <div className="space-y-1.5">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                SİSTEM MODÜLLERİ
              </span>

              {navItems.map((item) => {
                const active = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 cursor-not-allowed opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-md text-slate-500">
                        {item.badge}
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && !active && (
                      <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* BİLGİLENDİRME */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 leading-relaxed">
            Personel yetkileri, galeri albümü ve kurumsal firma tanımlamaları buradan yönetilir.
          </div>
        </aside>

        {/* SAĞ: DİNAMİK İÇERİK ALANI */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}