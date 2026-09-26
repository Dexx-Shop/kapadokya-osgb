"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

interface FaqItem {
  q: string;
  a: string | React.ReactNode;
}

const faqData: FaqItem[] = [
  {
    q: "İş güvenliği uzmanlarında kategori yükselmesi nasıl olur?",
    a: "(C) sınıfı iş güvenliği uzmanlığı belgesiyle en az üç yıl fiilen görev yaptığını belgeleyen ve (B) sınıfı iş güvenliği uzmanlığı eğitimine katılarak yapılacak (B) sınıfı iş güvenliği uzmanlığı sınavında başarılı olanlar (B) sınıfı iş güvenliği uzmanlığı belgesine sahip olabilir.\n(B) sınıfı iş güvenliği uzmanlığı belgesiyle en az dört yıl fiilen görev yaptığını belgeleyen ve (A) sınıfı iş güvenliği uzmanlığı eğitimine katılarak yapılacak (A) sınıfı iş güvenliği uzmanlığı sınavında başarılı olanlar (A) sınıfı iş güvenliği uzmanlığı belgesine sahip olabilir."
  },
  {
    q: "İş güvenliği uzmanlığı sertifikasına sahip olmayıp yıllardır bu alanda çalışanlar, C sınıfı sertifikadan mı başlayacaktır?",
    a: "C sınıfı sertifikaya sahip olmayan mühendis, mimar, teknik eleman veya iş sağlığı ve güvenliği programı mezunları, bu alanda çalışmış olsalar dahi C sınıfı sertifikadan başlayacaktır."
  },
  {
    q: "Eski yönetmelik iptal edilmeden önce ÇASGEM'e A ya da B sınıfı için başvuranlar, bu konuda bir hak iddia edebilir mi?",
    a: "Eski yönetmelik iptal edilmeden önce ÇASGEM' e A ya da B sınıfı için başvuranlar için de, tamamen yeni yönetmelik hükümleri geçerlidir."
  },
  {
    q: "Sınav soruları kim ya da kimler tarafından hazırlanır?",
    a: "Sınav soruları, Genel Müdürlük tarafından seçilen akademisyenlerden oluşan eğitim ve sınav komisyonu tarafından hazırlanır, sınavın uygulamasını yapan Milli Eğitim Bakanlığı'na teslim edilir."
  },
  {
    q: "Sınavlarda ne tür sorular çıkar?",
    a: "Bakanlıkça ilan edilen müfredat programı ile anlatılan konulardan çıkmaktadır."
  },
  {
    q: "Derslere devam zorunluluğu var mıdır?",
    a: "Adayların, teorik eğitimin en az %90'ına ve uygulamalı eğitimin tamamına katılımı zorunludur."
  },
  {
    q: "Staj yapılacak yeri kim belirler?",
    a: "Eğitim kurumu ve katılımcı birlikte belirlemektedir."
  },
  {
    q: "Staj yapılacak yerin bir kriteri var mıdır?",
    a: "Uygulamalı eğitimler; iş güvenliği uzmanları için en az bir iş güvenliği uzmanının(İş güvenliği uzmanının sertifika sınıfı aranmamaktadır) İşyeri hekimleri için en az bir işyeri hekiminin görevlendirilmiş olduğu işyerlerinde yapılır. Eğitim programının uygulama kısmı 40 saatten az olamaz."
  },
  {
    q: "Çalışma ve Sosyal Güvenlik Bakanlığı'na bağlı ÇASGEM'in verdiği sertifika ile özel sektördeki eğitim kurumlarının verdiği sertifika arasında bir fark var mıdır?",
    a: "Eğitimi, yetkili olmak şartıyla kim verirse versin, sınavda başarılı olanlar belge alabileceklerdir. ÇASGEM, üniversite ya da özel eğitim kurumlarının verdiği eğitim ve sonundaki eğitim katılım belgesinin yasal anlamda hiçbir farkı bulunmamaktadır."
  },
  {
    q: "Sınavda başarılı sayılabilmek için kaç puan alınması gerekir?",
    a: "Sınavlarda 100 puan üzerinden en az 70 puan alan adaylar başarılı sayılır."
  },
  {
    q: "TTB ve TMMOB eğitim verebilecekler mi?",
    a: "Bakanlıktan yetki belgesi almak şartıyla verebileceklerdir."
  },
  {
    q: "İşyeri hekimliği ve iş güvenliği uzmanlığı belgesinin geçerlilik süresi dolduğunda vize işlemleri nasıl yapılır?",
    a: "İş güvenliği uzmanı, işyeri hekimi veya diğer sağlık personeli belgesi sahibi olan kişilerin, belgelerini aldıkları tarihten itibaren beş yıllık aralıklarla eğitim kurumları tarafından düzenlenecek yenileme eğitim programlarına katılması zorunludur. Yenileme eğitimlerine katıldıktan sonra eğitim kurumunun verdiği belge ile Bakanlığa başvurulduktan sonra ilgili ücret yatırılır. Bu işlemlerden sonra geçerli belgelere Bakanlıkça vize yapılır."
  },
  {
    q: "Beş yılın sonunda tekrar sınava girilecek mi?",
    a: "İş güvenliği uzmanı, işyeri hekimi veya diğer sağlık personeli belgesi sahibi olan kişilerin, belgelerini aldıkları tarihten itibaren beş yıllık aralıklarla eğitim kurumları tarafından düzenlenecek yenileme eğitim programlarına katılması zorunludur. Yani, sadece yenileme eğitimi zorunludur. Tekrar sınava girilmeyecektir."
  },
  {
    q: "Sınavda 70 puan alınamazsa ne olur?",
    a: "Adaylar, en son katıldıkları eğitimin tarihinden itibaren üç yıl içinde en fazla iki defa ilgili sınavlara katılabilir. Bu sınavlarda başarılı olamayan veya eğitimin tarihinden üç yıl içinde sınava katılmayan adaylar yeniden eğitim programına katılmak zorundadır."
  },
  {
    q: "Risk değerlendirmesi kimler tarafından yapılır?",
    a: (
      <div>
        <p className="mb-2">Risk değerlendirmesi, işverenin oluşturduğu bir ekip tarafından gerçekleştirilir. Risk değerlendirmesi ekibi aşağıdakilerden oluşur:</p>
        <ul className="list-none space-y-1 pl-1">
          <li><strong>a)</strong> İşveren veya işveren vekili.</li>
          <li><strong>b)</strong> İşyerinde sağlık ve güvenlik hizmetini yürüten iş güvenliği uzmanları ile işyeri hekimleri.</li>
          <li><strong>c)</strong> İşyerindeki çalışan temsilcileri.</li>
          <li><strong>ç)</strong> İşyerindeki destek elemanları.</li>
          <li><strong>d)</strong> İşyerindeki bütün birimleri temsil edecek şekilde belirlenen ve işyerinde yürütülen çalışmalar, mevcut veya muhtemel tehlike kaynakları ile riskler konusunda bilgi sahibi çalışanlar.</li>
        </ul>
      </div>
    )
  },
  {
    q: "Birden fazla işveren olması durumunda risk değerlendirmesi nasıl yapılır?",
    a: "Aynı çalışma alanını birden fazla işverenin paylaşması durumunda, yürütülen işler için diğer işverenlerin yürüttüğü işler de göz önünde bulundurularak ayrı ayrı risk değerlendirmesi gerçekleştirilir. İşverenler, risk değerlendirmesi çalışmalarını, koordinasyon içinde yürütür, birbirlerini ve çalışan temsilcilerini tespit edilen riskler konusunda bilgilendirir.\n\nBirden fazla işyerinin bulunduğu iş merkezleri, iş hanları, sanayi bölgeleri veya siteleri gibi yerlerde, işyerlerinde ayrı ayrı gerçekleştirilen risk değerlendirmesi çalışmalarının koordinasyonu yönetim tarafından yürütülür. Yönetim; bu koordinasyonun yürütümünde, işyerlerinde iş sağlığı ve güvenliği yönünden diğer işyerlerini etkileyecek tehlikeler hususunda gerekli tedbirleri almaları için ilgili işverenleri uyarır. Bu uyarılara uymayan işverenleri Bakanlığa bildirir."
  },
  {
    q: "Asıl işveren ve alt işveren ilişkisinin bulunduğu işyerlerinde risk değerlendirmesi nasıl yapılır?",
    a: "Bir işyerinde bir veya daha fazla alt işveren bulunması halinde; her alt işveren yürüttükleri işlerle ilgili olarak, bu risk değerlendirmesi çalışmalarını yapar veya yaptırır.\n\nAlt işverenlerin risk değerlendirmesi çalışmaları konusunda asıl işverenin sorumluluk alanları ile ilgili ihtiyaç duydukları bilgi ve belgeler asıl işverence sağlanır. Asıl işveren, alt işverenlerce yürütülen risk değerlendirmesi çalışmalarını denetler ve bu konudaki çalışmaları koordine eder. Alt işverenler hazırladıkları risk değerlendirmesinin bir nüshasını asıl işverene verir. Asıl işveren; bu risk değerlendirmesi çalışmalarını kendi çalışmasıyla bütünleştirerek, risk kontrol tedbirlerinin uygulanıp uygulanmadığını izler, denetler ve uygunsuzlukların giderilmesini sağlar."
  },
  {
    q: "Hangi işyerlerinde risk değerlendirmesi yapılmalıdır?",
    a: "31/12/2012 tarihi itibariyle çalışan sayısı ve tehlike sınıfı farkı gözetmeksizin tüm işyerlerinde risk değerlendirmesi yapılacaktır."
  },
  {
    q: "İş sağlığı ve güvenliği kurulu hangi durumda ve kim tarafından oluşturulur?",
    a: "İşveren, elli ve daha fazla çalışanın bulunduğu ve altı aydan fazla süren sürekli işlerin yapıldığı işyerlerinde, iş sağlığı ve güvenliği ile ilgili çalışmalarda bulunmak üzere iş sağlığı ve güvenliği kurulunu oluşturur.\n\nİşverene bağlı, fabrika, müessese, işletme veya işletmeler grubu gibi birden çok işyeri bulunduğu hallerde elli ve daha fazla çalışanın bulunduğu her bir işyerinde ayrı ayrı kurul kurulur."
  },
  {
    q: "İş sağlığı ve güvenliği kurulu kimlerden oluşur?",
    a: (
      <div>
        <p className="mb-2">Kurul aşağıda belirtilen kişilerden oluşur:</p>
        <ul className="list-none space-y-1 pl-1">
          <li><strong>a)</strong> İşveren veya işveren vekili,</li>
          <li><strong>b)</strong> İş güvenliği uzmanı,</li>
          <li><strong>c)</strong> İşyeri hekimi,</li>
          <li><strong>ç)</strong> İnsan kaynakları, personel, sosyal işler veya idari ve mali işleri yürütmekle görevli bir kişi,</li>
          <li><strong>d)</strong> Bulunması halinde sivil savunma uzmanı,</li>
          <li><strong>e)</strong> Bulunması halinde formen, ustabaşı veya usta,</li>
          <li><strong>f)</strong> Çalışan temsilcisi, işyerinde birden çok çalışan temsilcisi olması halinde baş temsilci.</li>
        </ul>
      </div>
    )
  },
  {
    q: "Kimler 6331 sayılı İş Sağlığı ve Güvenliği Kanunu kapsamındadır?",
    a: "Kamu ve özel sektöre ait bütün işlere ve işyerlerine, bu işyerlerinin işverenleri ile işveren vekillerine, çırak ve stajyerler de dâhil olmak üzere tüm çalışanları kapsar."
  },
  {
    q: "Kimler 6331 sayılı İş Sağlığı ve Güvenliği Kanunu kapsamında değildir?",
    a: "Fabrika, bakım merkezi, dikimevi ve benzeri işyerlerindekiler hariç Türk Silahlı Kuvvetleri, genel kolluk kuvvetleri ve Milli İstihbarat Teşkilatı Müsteşarlığının faaliyetleri, afet ve acil durum birimlerinin müdahale faaliyetleri, ev hizmetleri, çalışan istihdam etmeksizin kendi nam ve hesabına mal ve hizmet üretimi yapanlar ve hükümlü ve tutuklulara yönelik infaz hizmetleri sırasında, iyileştirme kapsamında yapılan iş yurdu, eğitim, güvenlik ve meslek edindirme faaliyetlerinde çalışanlar kapsamda değildir."
  },
  {
    q: "Tam süreli işyeri hekimi görevlendirilen işyerlerinde diğer sağlık personeli görevlendirilmesi zorunlu mudur?",
    a: "Tam süreli işyeri hekimi görevlendirilen işyerlerinde diğer sağlık personeli görevlendirilmesi zorunlu değildir."
  },
  {
    q: "Tehlike sınıflarına göre hangi sertifikaya sahip iş güvenliği uzmanı çalıştırılmalıdır?",
    a: "Çok tehlikeli sınıfta yer alan işyerlerinde (A) sınıfı, tehlikeli sınıfta yer alan işyerlerinde en az (B) sınıfı, az tehlikeli sınıfta yer alan işyerlerinde ise en az (C) sınıfı iş güvenliği uzmanlığı belgesi gereklidir.\n\n31/01/2013 tarihli ve 28545sayılı Resmi Gazete'de yayımlanan \"İş güvenliği uzmanlarının görev, yetki, sorumluluk ve eğitimleri hakkında yönetmelikte değişiklik yapılmasına dair yönetmelik\" ine göre üç yıllık mesleki tecrübe ve (C) veya (B) sınıfı iş güvenliği uzmanlığı belgesine sahip iş güvenliği uzmanları; sektörel düzenleme kapsamında kendi meslek dallarına uygun işlerin yapıldığı işyeriyle sınırlı olmak üzere, bütün tehlike sınıflarındaki işyerlerinde maddenin yürürlüğe giriş tarihinden itibaren yedi yıl süresince görevlendirilebilirler."
  },
  {
    q: "Ciddi ve yakın bir tehlike ile karşılaşıldığında çalışan nasıl davranmalıdır?",
    a: "Çalışanlar; kendileri veya diğer kişilerin güvenliği için ciddi ve yakın bir tehlike ile karşılaştıkları ve amirine hemen haber veremedikleri durumlarda; istenmeyen sonuçların önlenmesi için, bilgileri ve mevcut teknik donanımları çerçevesinde müdahale edebilirler. Böyle bir durumda çalışanlar, ihmal veya dikkatsiz davranışları olmadıkça yaptıkları müdahaleden dolayı sorumlu tutulamaz."
  },
  {
    q: "Çalışmaktan kaçınma hakkı nedir?",
    a: "Ciddi ve yakın tehlike ile karşı karşıya kalan çalışanlar kurula, kurulun bulunmadığı işyerlerinde ise işverene başvurarak durumun tespit edilmesini ve gerekli tedbirlerin alınmasına karar verilmesini talep edebilir. Kurul acilen toplanarak, işveren ise derhâl kararını verir ve durumu tutanakla tespit eder. Karar, çalışana ve çalışan temsilcisine yazılı olarak bildirilir. Kurul veya işverenin çalışanın talebi yönünde karar vermesi hâlinde çalışan, gerekli tedbirler alınıncaya kadar çalışmaktan kaçınabilir. Çalışanların çalışmaktan kaçındığı dönemdeki ücreti ile kanunlardan ve iş sözleşmesinden doğan diğer hakları saklıdır."
  },
  {
    q: "İşveren, iş kazası ve meslek hastalıklarının kayıt ve bildirimini nasıl yapar?",
    a: "İşveren; iş kazalarını kazadan sonraki üç iş günü içinde ve sağlık hizmeti sunucuları veya işyeri hekimi tarafından kendisine bildirilen meslek hastalıklarını da, öğrendiği tarihten itibaren üç iş günü içinde Sosyal Güvenlik Kurumuna bildirir."
  },
  {
    q: "Sağlık hizmeti sunucuları, iş kazası ve meslek hastalıklarının kayıt ve bildirimini nasıl yapar?",
    a: "Sağlık hizmeti sunucuları kendilerine intikal eden iş kazalarını, yetkilendirilen sağlık hizmeti sunucuları ise meslek hastalığı tanısı koydukları vakaları en geç on gün içinde Sosyal Güvenlik Kurumuna bildirir."
  },
  {
    q: "Çalışan temsilcisi sayısı nasıl belirlenir?",
    a: (
      <ul className="space-y-1.5 pl-1">
        <li>– İki ile elli arasında çalışanı bulunan işyerlerinde bir,</li>
        <li>– Ellibir ile yüz arasında çalışanı bulunan işyerlerinde iki,</li>
        <li>– Yüzbir ile beşyüz arasında çalışanı bulunan işyerlerinde üç,</li>
        <li>– Beşyüzbir ile bin arasında çalışanı bulunan işyerlerinde dört,</li>
        <li>– Binbir ile ikibin arasında çalışanı bulunan işyerlerinde beş,</li>
        <li>– İkibinbir ve üzeri çalışanı bulunan işyerlerinde altı çalışan temsilcisi bulunmalıdır.</li>
      </ul>
    )
  },
  {
    q: "Sağlık raporunun hangi şartlarda alınması zorunludur?",
    a: "Tehlikeli ve çok tehlikeli sınıfta yer alan işyerlerinde çalışacaklar, yapacakları işe uygun olduklarını belirten sağlık raporuna sahip olmalıdır."
  },
  {
    q: "Sağlık raporu nerelerden alınır?",
    a: "Sağlık raporları, işyeri sağlık ve güvenlik biriminde veya hizmet alınan ortak sağlık ve güvenlik biriminde görevli olan işyeri hekiminden alınır.\n\nAncak; 6331 sayılı İş Sağlığı ve Güvenliği Kanunu gereğince işyeri hekimi istihdamı zorunluluğu henüz başlamamış olan işyerleri, Kanunun ilgili maddeleri yürürlüğe girene kadar, söz konusu bu raporları Kanun öncesinde olduğu gibi kamu sağlık hizmeti sunucularından alabilirler."
  },
  {
    q: "Çalışanlara hangi hallerde sağlık muayeneleri yapılır?",
    a: (
      <ul className="space-y-1.5 pl-1">
        <li>– İşe girişlerde</li>
        <li>– İş değişikliğinde</li>
        <li>– İş kazası, meslek hastalığı veya sağlık nedeniyle tekrarlanan işten uzaklaşmalarından sonra işe dönüşlerinde talep etmeleri hâlinde</li>
        <li>– İşin devamı süresince, çalışanın ve işin niteliği ile işyerinin tehlike sınıfına göre Bakanlıkça belirlenen düzenli aralıklarla sağlık muayeneleri yapılır.</li>
      </ul>
    )
  },
  {
    q: "Küçük işletmelerde iş sağlığı ve güvenliği hizmetlerinin yerine getirilmesinde devlet desteği ne şekilde olacaktır?",
    a: "Kamu kurum ve kuruluşları hariç ondan az çalışanı bulunanlardan, çok tehlikeli ve tehlikeli sınıfta yer alan işyerleri devlet desteğinden faydalanabilir. Ancak, Bakanlar Kurulu, ondan az çalışanı bulunanlardan az tehlikeli sınıfta yer alan işyerlerinin de faydalanmasına karar verebilir."
  },
  {
    q: "Güvenlik raporu veya büyük kaza önleme politika belgesi nedir?",
    a: "İşletmeye başlanmadan önce, büyük endüstriyel kaza oluşabilecek işyerleri için, işyerlerinin büyüklüğüne göre işveren tarafından hazırlanması gereken rapordur.\nGüvenlik raporu hazırlama yükümlülüğü bulunan işveren, hazırladıkları güvenlik raporlarının içerik ve yeterlilikleri Bakanlıkça incelenmesini müteakip işyerlerini işletmeye açabilir."
  },
  {
    q: "İşyerinin tehlike sınıfı nasıl belirlenir?",
    a: "İşyerinizin (Minimum) 23 haneli olan SGK Sicil Numarasının en başından 2.3.4. ve 5 karakterleri iş kolu kodu/faaliyet kodu/ tescil kodu olarak isimlendirilir. Bu 4 haneli kod sizin esas faaliyetinizi tanımlamaktadır. Bu 4 lü kodu İş Sağlığı ve Güvenliğine İlişkin İşyeri Tehlike Sınıfları Tebliğinde bulduktan sonra, 4 lü iş kolu konusunun altında yazılmış faaliyetlerden yaptığınız işi en iyi tanımlayan kod seçilir. Seçtiğiniz kod 6 lı NACE kodunuz, karşısında yazan tehlike sınıfı da işyerinizin tehlike sınıfıdır."
  },
  {
    q: "İşyeri tescil kodunun tebliğde bulunmadığı durumlarda işyerinin tehlike sınıfı nasıl belirlenir?",
    a: "İşyerinizin (Minimum) 23 haneli olan SGK Sicil Numarasının en başından 2.3.4. ve 5 karakterleri iş kolu kodu/faaliyet kodu/ tescil kodu olarak isimlendirilir. Bu 4 haneli kod sizin esas faaliyetinizi tanımlamaktadır. Bazı iş kolu kodu/faaliyet kodu/ tescil kodlarının İş Sağlığı ve Güvenliğine İlişkin İşyeri Tehlike Sınıfları Tebliğinde karşılığı bulunmamaktadır. Bu kodlar için aşağıdaki tabloya göre önce doğru 4 lü kod seçmeli, sonra seçtikleri 4 lü iş kolu konusunun altında yazılmış faaliyetlerden yapılan işi en iyi tanımlayan altılı kod seçilmelidir. Seçilen kod 6 lı NACE kodu, karşısında yazan tehlike sınıfı da işyerinin tehlike sınıfıdır."
  },
  {
    q: "Fazla çalışmanın yasak olduğu durumlar hangileridir?",
    a: "4857 sayılı Kanun'un 63 üncü maddesine göre çıkarılan “Sağlık Kuralları Bakımından Günde Ancak Yedibuçuk Saat veya Daha Az Çalışılması Gereken İşler Hakkında Yönetmelik” kapsamına giren işlerde ve yine Kanun'un 69 uncu maddesinde belirtilen gece çalışmasında fazla çalışma yapılamaz."
  }
];

export default function SssPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // İlk soru varsayılan açık gelsin

  const toggleAccordion = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. ÜST HERO BAŞLIK */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#427fcb] via-[#6399dc] to-[#9ec6f2] pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#d84315] shadow-sm backdrop-blur-md mb-3">
            <HelpCircle className="h-4 w-4" />
            <span>Mevzuat & Bilgilendirme</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Sıkça Sorulan Sorular
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="text-white/60">—</span>
            <span className="text-amber-200 font-semibold">Sıkça Sorulan Sorular</span>
          </div>
        </div>
      </section>

      {/* 2. TÜM SORULAR LİSTESİ (AKORDİYON) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d84315]">
              6331 Sayılı İSG Kanunu Rehberi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Merak Edilen Tüm Sorular ve Yasal Cevapları
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Detayını incelemek istediğiniz sorunun üzerine tıklayarak yasal açıklamasını görüntüleyebilirsiniz.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqData.map((item, idx) => {
              const isOpen = openIndices.includes(idx);

              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full py-5 flex items-center justify-between text-left gap-4 hover:text-[#d84315] transition cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2.5">
                      <span className="text-[#d84315] font-black shrink-0">▲</span>
                      <span>{item.q}</span>
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#d84315]" : ""
                    }`} />
                  </button>

                  {isOpen && (
                    <div className="pb-6 pl-6 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </main>
  );
}