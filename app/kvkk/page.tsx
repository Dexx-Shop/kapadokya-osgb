import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function KvkkPage() {
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">KVKK Aydınlatma Metni</h1>
            <p className="text-xs text-slate-500">6698 Sayılı Kişisel Verilerin Korunması Kanunu Uyarınca</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Veri Sorumlusu</h2>
            <p>
              Kapadokya Ortak Sağlık ve Güvenlik Birimi (“Kapadokya OSGB”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu sıfatıyla kişisel verilerinizi kanuni sınırlar çerçevesinde işlemekteyiz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Kişisel Verilerin İşlenme Amacı</h2>
            <p>
              Kişisel verileriniz; 6331 sayılı İSG Kanunu ve ilgili mevzuat tahtında iş güvenliği uzmanlığı, işyeri hekimliği, sağlık raporları, ortam ölçümleri ve risk analizi hizmetlerinin yürütülmesi, müşteri portföy yönetimi ve yasal bildirimlerin yapılması amacıyla işlenmektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Kişisel Verilerin Aktarılması</h2>
            <p>
              Toplanan veriler, yalnızca yasal zorunluluk halinde ilgili kamu kurum ve kuruluşları (T.C. Çalışma ve Sosyal Güvenlik Bakanlığı, İSG-KATİP vb.) ile adli ve idari merciler dışında hiçbir üçüncü şahıs veya reklam amacıyla paylaşılmaz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. İlgili Kişinin Hakları (Madde 11)</h2>
            <p>
              KVKK’nın 11. maddesi uyarınca veri sahipleri; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini talep etme haklarına sahiptir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Başvuru Usulü</h2>
            <p>
              Haklarınıza ilişkin başvurularınızı yazılı olarak veya şirketimizin kayıtlı e-posta adresi olan <strong className="text-slate-900">info@kapadokyaosgb.com</strong> adresine iletebilirsiniz. Başvurular en geç 30 gün içinde sonuçlandırılır.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}