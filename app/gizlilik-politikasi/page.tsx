import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function GizlilikPolitikasiPage() {
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
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Gizlilik Politikası</h1>
            <p className="text-xs text-slate-500">Son Güncelleme: 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Genel Bilgilendirme</h2>
            <p>
              Kapadokya OSGB olarak, web sitemizi ziyaret eden kullanıcılarımızın ve hizmet sunduğumuz kurumların gizliliğine azami hassasiyet göstermekteyiz. Bu politika, sitemizi ziyaretiniz ve hizmetlerimizi kullanımınız esnasında toplanan verilerin nasıl korunduğunu açıklar.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Toplanan Bilgiler</h2>
            <p>
              Hizmet teklifi alma, müşteri portalı kayıt ve insan kaynakları başvuruları süreçlerinde ad, soyad, e-posta adresi, telefon numarası ve işletme detayları gibi sınırlı kişisel bilgileriniz yalnızca açık rızanız doğrultusunda toplanır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Bilgilerin Kullanım Amacı</h2>
            <p>
              Toplanan veriler; 6331 sayılı İş Sağlığı ve Güvenliği Kanunu kapsamında yasal yükümlülüklerin yerine getirilmesi, İSG evrak ve denetim raporlarının koordinasyonu, müşteri taleplerinin karşılanması ve sizlerle sağlıklı iletişim kurulması amacıyla işlenir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Bilgi Güvenliği</h2>
            <p>
              Sistemlerimizde yer alan kişisel veriler, yetkisiz erişim, ifşa, kayıp ve tahribata karşı 256-bit SSL güvenlik protokolleri ve modern şifreleme yöntemleriyle üst düzey güvenlik tedbirleri altında muhafaza edilmektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. İletişim</h2>
            <p>
              Gizlilik politikamız hakkındaki tüm soru ve talepleriniz için <strong className="text-slate-900">info@kapadokyaosgb.com</strong> e-posta adresi üzerinden bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}