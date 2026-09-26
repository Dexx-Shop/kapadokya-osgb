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
  ExternalLink,
  Users,
  FileText,
  FileSpreadsheet,
  Loader2,
  Sparkles
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

      // 1. KONTROL: Sabit listedeyse doğrudan geç
      if (isSuperAdminEmail(user.email)) {
        setCurrentUser(user);
        setLoading(false);
        return;
      }

      // 2. KONTROL: Veritabanı admin kontrolü
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-[#d84315]" />
        <span className="text-xs font-bold text-slate-400">Yönetici Paneli Doğrulanıyor...</span>
      </main>
    );
  }

  const navItems = [
    {
      name: "Profil & Güvenlik",
      href: "/admin/profil",
      icon: UserCog,
      badge: "Yönetici"
    },
    {
      name: "Rapor Kayıtları (Loglar)",
      href: "/admin/rapor-kayitlari",
      icon: FileSpreadsheet,
      badge: "Muhasebe/Kasa"
    },
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
      name: "İş Başvuruları (CV)",
      href: "/admin/basvurular",
      icon: FileText,
      badge: "Yakında",
      disabled: true
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pt-[76px] text-slate-900">
      
      {/* Mobil Üst Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#d84315]" />
          <span className="font-extrabold text-sm text-slate-900">Yönetim Konsolu</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 mx-auto w-full max-w-[1500px] flex px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* SOL SIDEBAR MENÜ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:rounded-3xl lg:border lg:shadow-sm ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            
            {/* ÜST: YÖNETİCİ PROFİL KARTI */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d84315] text-white font-black text-sm shadow-md">
                  {currentUser?.user_metadata?.full_name?.charAt(0) || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Süper Admin</span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">
                    {currentUser?.user_metadata?.full_name || "Yönetici"}
                  </h3>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser?.email}
              </p>
            </div>

            {/* MENÜ BAĞLANTILARI */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                YÖNETİM MODÜLLERİ
              </span>

              {navItems.map((item) => {
                const active = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-400">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      active
                        ? "bg-[#d84315] text-white shadow-md shadow-[#d84315]/25"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && !active && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* SİTEYE DÖNÜŞ & ÇIKIŞ */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <Link
              href="/"
              className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Siteyi Görüntüle</span>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Güvenli Çıkış</span>
            </button>
          </div>

        </aside>

        {/* SAĞ DİNAMİK İÇERİK ALANI */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}