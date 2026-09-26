import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-slate-200">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#d84315] hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Anasayfaya Dön</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d84315]/10 text-[#d84315]">
            <Cookie className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Çerez Politikası</h1>
            <p className="text-xs text-slate-500">Web Sitesi Çerezleri ve Tercih Yönetimi</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Çerez (Cookie) Nedir?</h2>
            <p>
              Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler web sitemizin daha verimli çalışmasını ve oturum güvenliğinizi sağlamak için kullanılır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Sitemizde Kullanılan Çerez Türleri</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong className="text-slate-800">Zorunlu Çerezler:</strong> Müşteri portalı oturum yönetimi (Supabase Auth oturum doğrulaması) ve web sitesinin güvenli şekilde çalışması için teknik olarak elzem olan çerezlerdir.</li>
              <li><strong className="text-slate-800">Performans ve İşlevsellik Çerezleri:</strong> Sayfa yükleme hızını optimize etmek ve kullanıcı deneyimini iyileştirmek için kullanılan temel verilerdir.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Çerezlerin Yönetimi</h2>
            <p>
              İnternet tarayıcınızın ayarlarından çerezleri dilediğiniz zaman silebilir, engelleyebilir veya sınırlandırabilirsiniz. Ancak zorunlu çerezlerin kapatılması durumunda müşteri portalına giriş gibi bazı temel özelliklerin çalışmayabileceğini hatırlatırız.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}