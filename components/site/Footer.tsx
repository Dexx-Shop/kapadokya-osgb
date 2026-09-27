import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  HeartHandshake
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* ÜST KATMAN: ŞİRKET BİLGİSİ & İLETİŞİM */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80 items-start">
          
          {/* SOL: DOĞRU LOGO & ŞİRKET TANITIMI (7 Sütun) */}
          <div className="md:col-span-7 space-y-4">
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <Image
                src="/kapadokya-osgb-logo.png"
                alt="Kapadokya OSGB"
                width={320}
                height={90}
                className="h-14 sm:h-16 w-auto object-contain drop-shadow"
              />
            </Link>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Kapadokya OSGB; iş sağlığı ve güvenliği süreçlerinizi yasal mevzuata %100 uyumlu, proaktif saha denetimleri ve profesyonel uzman kadrosuyla güvenle yönetir. İşletmenizin risklerini minimize ederken çalışanlarınızın sağlığını güvence altına alır.
            </p>
          </div>

          {/* SAĞ: İLETİŞİM (5 Sütun) */}
          <div className="md:col-span-5 space-y-4 md:pl-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#d84315]" />
              İletişim
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#ff7043] shrink-0 mt-0.5" />
                <span>Kapadokya / Nevşehir, Türkiye</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#ff7043] shrink-0" />
                <a href="tel:+903840000000" className="hover:text-white transition">
                  0 (0384) 213 02 00
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#ff7043] shrink-0" />
                <a href="mailto:info@kapadokyaosgb.com" className="hover:text-white transition">
                  info@kapadokyadanismanlik.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#ff7043] shrink-0" />
                <span>Pazartesi - Cumartesi: 08:30 - 18:00</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
                <HeartHandshake className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-white block">Kesintisiz Saha Desteği</span>
                  Denetim ve acil durumlarda işletmenizin yanındayız.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ALT KATMAN: TELİF & YASAL LİNKLER */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kapadokya OSGB. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center">
            <Link href="/gizlilik-politikasi" className="hover:text-slate-300 transition underline-offset-4 hover:underline">
              Gizlilik Politikası
            </Link>
            <span>•</span>
            <Link href="/kvkk" className="hover:text-slate-300 transition underline-offset-4 hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            <span>•</span>
            <Link href="/cerez-politikasi" className="hover:text-slate-300 transition underline-offset-4 hover:underline">
              Çerez Politikası
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}