"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("E-posta veya şifre hatalı.");
      setIsLoading(false);
      return;
    }

    // Yönlendir ve sayfayı anında tazele
    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-b from-[#4482cf] via-[#75a8e5] to-[#cbe1fb]">
      
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="transition-transform hover:scale-105 mb-3">
            <Image
              src="/kapadokyalogo.png"
              alt="Kapadokya OSGB"
              width={260}
              height={75}
              className="h-16 w-auto object-contain drop-shadow"
              priority
            />
          </Link>
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d84315]/10 px-3 py-1 text-xs font-bold text-[#d84315] mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Müşteri Portalı Girişi</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Panelinize erişmek için lütfen giriş bilgilerinizi yazın.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">E-posta</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="ornek@sirketiniz.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-[#d84315] focus:outline-none focus:ring-2 focus:ring-[#d84315]/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Şifre</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-[#d84315] focus:outline-none focus:ring-2 focus:ring-[#d84315]/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#d84315] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#d84315]/30 hover:bg-[#bf360c] transition active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Hesabınız yok mu?{" "}
          <Link href="/kayit-ol" className="font-bold text-[#d84315] hover:underline">
            Hemen Kayıt Olun
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Güvenli Oturum Protokolü</span>
        </div>

      </div>
    </main>
  );
}