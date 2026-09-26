"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail, MOTHER_EMAIL } from "@/lib/constants";
import { 
  ChevronDown, 
  Menu, 
  X, 
  UserPlus, 
  LogOut, 
  UserCheck, 
  ShieldAlert,
  FileSpreadsheet,
  Briefcase,
  Flower2,
  LayoutDashboard
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const servicesList = [
  "Risk Değerlendirmesi",
  "Acil Durumlar",
  "Ölçümler",
  "İş Güvenliği",
  "İlk Yardım",
  "Mobil Sağlık",
  "Eğitimler"
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileIkOpen, setMobileIkOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [ikDropdown, setIkDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    async function checkRole(user: SupabaseUser) {
      if (isSuperAdminEmail(user.email)) {
        setIsAdmin(true);
        setIsStaff(true);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role, staff_role, is_active")
        .eq("id", user.id)
        .single();

      if (data && data.is_active !== false) {
        setIsAdmin(data.role === "admin");
        setIsStaff(data.staff_role === "muhasebe" || data.staff_role === "alt_kat");
      } else {
        setIsAdmin(false);
        setIsStaff(false);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) checkRole(user);
      else {
        setIsAdmin(false);
        setIsStaff(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) checkRole(user);
      else {
        setIsAdmin(false);
        setIsStaff(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
    setIsStaff(false);
    router.refresh();
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const isMother = currentUser?.email?.toLowerCase() === MOTHER_EMAIL.toLowerCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/20 bg-white/20 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center py-1 transition-transform hover:scale-[1.02]">
          <Image
            src="/kapadokya-osgb-logo.png"
            alt="Kapadokya OSGB"
            width={320}
            height={90}
            className="h-14 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
            priority
          />
        </Link>

        {/* MASAÜSTÜ MENÜ */}
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/"
            className={`rounded-lg px-2 py-2 text-sm transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${
              isActive("/") 
                ? "font-black text-[#d84315] drop-shadow-sm" 
                : "font-bold text-white hover:text-[#d84315]"
            }`}
          >
            Anasayfa
          </Link>

          <Link
            href="/kurumsal"
            className={`rounded-lg px-2 py-2 text-sm transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${
              isActive("/kurumsal") 
                ? "font-black text-[#d84315] drop-shadow-sm" 
                : "font-bold text-white hover:text-[#d84315]"
            }`}
          >
            Kurumsal
          </Link>

          {/* Hizmetlerimiz */}
          <div 
            className="relative"
            onMouseEnter={() => setServicesDropdown(true)}
            onMouseLeave={() => setServicesDropdown(false)}
          >
            <div
              className={`flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition cursor-default select-none ${
                servicesDropdown ? "text-[#d84315]" : "hover:text-[#d84315]"
              }`}
            >
              <span>Hizmetlerimiz</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                servicesDropdown ? "rotate-180 text-[#d84315]" : "text-white"
              }`} />
            </div>

            {servicesDropdown && (
              <div className="absolute left-0 top-full pt-2 w-64 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl border-t-2 border-t-[#d84315]">
                  <ul className="divide-y divide-slate-100">
                    {servicesList.map((service, index) => (
                      <li
                        key={index}
                        className="px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 transition hover:text-[#d84315] hover:bg-slate-50 rounded-lg cursor-default select-none"
                      >
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/referanslarimiz"
            className={`rounded-lg px-2 py-2 text-sm transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${
              isActive("/referanslarimiz") 
                ? "font-black text-[#d84315] drop-shadow-sm" 
                : "font-bold text-white hover:text-[#d84315]"
            }`}
          >
            Referanslarımız
          </Link>

          <Link
            href="/galeri"
            className={`rounded-lg px-2 py-2 text-sm transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${
              isActive("/galeri") 
                ? "font-black text-[#d84315] drop-shadow-sm" 
                : "font-bold text-white hover:text-[#d84315]"
            }`}
          >
            Galeri
          </Link>

          {/* İnsan Kaynakları */}
          <div 
            className="relative"
            onMouseEnter={() => setIkDropdown(true)}
            onMouseLeave={() => setIkDropdown(false)}
          >
            <div
              className={`flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition cursor-default select-none ${
                pathname.startsWith("/iletisim") || pathname.startsWith("/sss") ? "text-[#d84315]" : "hover:text-[#d84315]"
              }`}
            >
              <span>İnsan Kaynakları</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                ikDropdown ? "rotate-180 text-[#d84315]" : "text-white"
              }`} />
            </div>

            {ikDropdown && (
              <div className="absolute left-0 top-full pt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-white/80 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl border-t-2 border-t-[#d84315]">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/iletisim"
                        className={`block px-3 py-2.5 text-xs sm:text-sm font-bold transition hover:text-[#d84315] hover:bg-slate-50 rounded-xl ${
                          pathname === "/iletisim" ? "text-[#d84315] bg-slate-50" : "text-slate-800"
                        }`}
                      >
                        Nevşehir İletişim
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sss"
                        className={`block px-3 py-2.5 text-xs sm:text-sm font-bold transition hover:text-[#d84315] hover:bg-slate-50 rounded-xl ${
                          pathname === "/sss" ? "text-[#d84315] bg-slate-50" : "text-slate-800"
                        }`}
                      >
                        Sıkça Sorulan Sorular
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* SAĞ TARAF BUTONLAR */}
        <div className="flex items-center gap-2.5">
          
          {/* YÖNETİM AÇILIR MENÜSÜ */}
          {(isAdmin || isStaff) && (
            <div 
              className="relative hidden sm:block"
              onMouseEnter={() => setAdminDropdown(true)}
              onMouseLeave={() => setAdminDropdown(false)}
            >
              <button
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition border shadow-sm cursor-pointer ${
                  pathname.startsWith("/admin") || pathname === "/yonetici-odasi" || pathname === "/rapor-girisi"
                    ? "bg-[#d84315] text-white border-[#d84315] shadow-md shadow-[#d84315]/25"
                    : "bg-slate-900/90 text-white border-slate-700/80 hover:bg-slate-900"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Yönetim</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${adminDropdown ? "rotate-180" : ""}`} />
              </button>

              {adminDropdown && (
                <div className="absolute right-0 top-full pt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Hızlı İşlem Menüsü
                    </div>

                    {isAdmin && (
                      <Link
                        href="/yonetici-odasi"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:text-[#d84315] hover:bg-slate-50 rounded-xl transition"
                      >
                        {isMother ? <Flower2 className="h-4 w-4 text-rose-500" /> : <Briefcase className="h-4 w-4 text-amber-500" />}
                        <span>{isMother ? "Özel Yönetici Odası" : "Çalışma Masam"}</span>
                      </Link>
                    )}

                    <Link
                      href="/rapor-girisi"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span>Sağlık Raporu Girişi</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/rapor-kayitlari"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:text-[#d84315] hover:bg-slate-50 rounded-xl transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-slate-600" />
                        <span>Genel Yönetim Paneli</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KULLANICI / ÇIKIŞ ALANI */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5">
              {/* Profil Butonu: Sadece normal kullanıcılar ve alt personel görür */}
              {!isAdmin && (
                <Link
                  href="/profil"
                  title="Profil Ayarları"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold backdrop-blur-md shadow-sm border transition ${
                    isActive("/profil")
                      ? "bg-white text-[#d84315] border-white shadow-md"
                      : "bg-white/70 text-slate-800 border-white/50 hover:bg-white hover:text-[#d84315]"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="max-w-[110px] truncate">
                    {currentUser.user_metadata?.full_name || currentUser.email}
                  </span>
                </Link>
              )}

              {/* Güvenli Çıkış Butonu */}
              <button
                onClick={handleLogout}
                title="Çıkış Yap"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/90 text-white hover:bg-rose-700 transition shadow-sm active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/kayit-ol"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#d84315] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Giriş Yap</span>
            </Link>
          )}

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-white transition hover:bg-white hover:text-slate-900 lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* MOBİL MENÜ */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 pb-6 pt-3 lg:hidden shadow-2xl animate-in slide-in-from-top-3 backdrop-blur-2xl">
          <div className="flex flex-col space-y-1.5">
            
            {isAdmin && (
              <Link
                href="/yonetici-odasi"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black text-white shadow-sm ${
                  isMother 
                    ? "bg-gradient-to-r from-rose-600 to-purple-600 shadow-rose-500/25" 
                    : "bg-gradient-to-r from-amber-600 to-[#d84315] shadow-amber-500/25"
                }`}
              >
                {isMother ? <Flower2 className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                <span>{isMother ? "Özel Yönetici Odası" : "Yönetici Çalışma Masam"}</span>
              </Link>
            )}

            {(isStaff || isAdmin) && (
              <Link
                href="/rapor-girisi"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Sağlık Raporu Giriş Ekranı</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/rapor-kayitlari"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white shadow-sm"
              >
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Genel Yönetim Konsolu</span>
              </Link>
            )}

            {/* Oturum Durumu & Çıkış */}
            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 my-1">
                {!isAdmin ? (
                  <Link
                    href="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-slate-800 truncate"
                  >
                    {currentUser.user_metadata?.full_name || currentUser.email}
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-slate-700">
                    {currentUser.user_metadata?.full_name || currentUser.email}
                  </span>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 my-1">
                <Link
                  href="/giris-yap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit-ol"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-[#d84315] py-2 text-xs font-bold text-white"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            <div className="h-px bg-slate-100 my-1" />

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isActive("/") ? "font-black text-[#d84315] bg-[#d84315]/5" : "font-semibold text-slate-800"
              }`}
            >
              Anasayfa
            </Link>
            
            <Link
              href="/kurumsal"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isActive("/kurumsal") ? "font-black text-[#d84315] bg-[#d84315]/5" : "font-semibold text-slate-800"
              }`}
            >
              Kurumsal
            </Link>

            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800"
              >
                <span>Hizmetlerimiz</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180 text-[#d84315]" : ""}`} />
              </button>
              {mobileServicesOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-1">
                  {servicesList.map((service, index) => (
                    <div
                      key={index}
                      className="py-1 text-xs font-bold text-slate-600"
                    >
                      • {service}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/referanslarimiz"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isActive("/referanslarimiz") ? "font-black text-[#d84315] bg-[#d84315]/5" : "font-semibold text-slate-800"
              }`}
            >
              Referanslarımız
            </Link>

            <Link
              href="/galeri"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3.5 py-2 text-sm transition ${
                isActive("/galeri") ? "font-black text-[#d84315] bg-[#d84315]/5" : "font-semibold text-slate-800"
              }`}
            >
              Galeri
            </Link>

            <div>
              <button
                onClick={() => setMobileIkOpen(!mobileIkOpen)}
                className="w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800"
              >
                <span>İnsan Kaynakları</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileIkOpen ? "rotate-180 text-[#d84315]" : ""}`} />
              </button>
              {mobileIkOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-1">
                  <Link
                    href="/iletisim"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-xs font-bold text-slate-700 hover:text-[#d84315]"
                  >
                    • Nevşehir İletişim
                  </Link>
                  <Link
                    href="/sss"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-xs font-bold text-slate-700 hover:text-[#d84315]"
                  >
                    • Sıkça Sorulan Sorular
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}