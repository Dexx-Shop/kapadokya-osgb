"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FATHER_EMAIL, MOTHER_EMAIL } from "@/lib/constants";
import { 
  Briefcase, 
  ExternalLink, 
  Calculator, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Heart, 
  Sparkles, 
  Flower2, 
  Wind, 
  Sun, 
  BookOpen, 
  Coffee,
  Check
} from "lucide-react";

export default function ExecutivePrivatePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Ortak Not / Görev State'i (LocalStorage ile tarayıcıda kalıcı saklanır)
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  // Babanın Hesap Makinesi State'i
  const [calcAmount, setCalcAmount] = useState<string>("");
  const [calcKdvRate, setCalcKdvRate] = useState<number>(20);
  const [includeTevkifat, setIncludeTevkifat] = useState<boolean>(false);

  // Annenin Yoga / Nefes State'i
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Nefes Al (4s)" | "Tut (4s)" | "Ver (4s)" | "Bekle (4s)">("Nefes Al (4s)");
  const [waterCount, setWaterCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        setUserName(user.user_metadata?.full_name || "Yönetici");
      }

      // Yerel görevleri yükle
      const savedTasks = localStorage.getItem("exec_tasks");
      if (savedTasks) {
        try { setTasks(JSON.parse(savedTasks)); } catch {}
      }

      const savedWater = localStorage.getItem("exec_water");
      if (savedWater) setWaterCount(Number(savedWater));

      setLoading(false);
    }
    init();
  }, [supabase]);

  // Görev Yönetimi
  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const updated = [...tasks, { id: Date.now().toString(), text: newTaskText.trim(), done: false }];
    setTasks(updated);
    localStorage.setItem("exec_tasks", JSON.stringify(updated));
    setNewTaskText("");
  }

  function toggleTask(id: string) {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    localStorage.setItem("exec_tasks", JSON.stringify(updated));
  }

  function deleteTask(id: string) {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem("exec_tasks", JSON.stringify(updated));
  }

  // Nefes Egzersizi Döngüsü
  useEffect(() => {
    if (!breathingActive) return;
    const phases: Array<"Nefes Al (4s)" | "Tut (4s)" | "Ver (4s)" | "Bekle (4s)"> = [
      "Nefes Al (4s)",
      "Tut (4s)",
      "Ver (4s)",
      "Bekle (4s)"
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setBreathPhase(phases[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  function addWater() {
    const next = waterCount + 1;
    setWaterCount(next);
    localStorage.setItem("exec_water", next.toString());
  }

  const isMother = userEmail?.toLowerCase() === MOTHER_EMAIL.toLowerCase();

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Çalışma alanı hazırlanıyor...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. ANNENİN ÖZEL ÇALIŞMA & FARKINDALIK ALANI */}
      {/* ========================================================================= */}
      {isMother ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Üst Karşılama Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-rose-100 backdrop-blur-md mb-2">
                  <Flower2 className="h-3.5 w-3.5 text-rose-200" />
                  <span>Kişisel Yönetici & Farkındalık Alanı</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">Hoş Geldiniz, {userName}</h1>
                <p className="text-xs text-rose-100 mt-1 max-w-xl">
                  Günün koşturmacası arasında sakin kalmak, işleri dinginlikle yönetmek ve kendinize bir nefeslik alan açmak için burası sizin özel köşeniz.
                </p>
              </div>

              {/* Günlük Olumlama Kartı */}
              <div className="rounded-2xl bg-white/15 backdrop-blur-md p-4 border border-white/20 max-w-xs text-xs italic text-rose-50">
                <Sparkles className="h-4 w-4 text-amber-200 mb-1" />
                &ldquo;Zihnini sakinleştirdiğinde, her zorluğun arkasındaki berrak çözümü görürsün. Bugün senin günün.&rdquo;
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sol: 4-4-4-4 Kutu Nefesi & Meditasyon Aracı */}
            <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wind className="h-5 w-5 text-rose-500" />
                    <span>1 Dakikalık Zihin Dinlendirme (Kutu Nefesi)</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    Yoga & Meditasyon
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Toplantı öncesi ya da yorucu bir telefonun ardından zihninizi toplamak için 4 saniyelik kare nefes döngüsünü başlatın.
                </p>

                {/* Nefes Animasyon Alanı */}
                <div className="my-8 flex flex-col items-center justify-center">
                  <div className={`flex h-36 w-36 items-center justify-center rounded-full transition-all duration-1000 ${
                    breathingActive 
                      ? "bg-rose-100 border-4 border-rose-400 scale-110 shadow-lg shadow-rose-200" 
                      : "bg-slate-50 border-2 border-slate-200 scale-100"
                  }`}>
                    <span className="text-center text-xs font-bold text-rose-800 px-2">
                      {breathingActive ? breathPhase : "Nefese Başla"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setBreathingActive(!breathingActive)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                    breathingActive 
                      ? "bg-slate-900 text-white hover:bg-slate-800" 
                      : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
                  }`}
                >
                  {breathingActive ? "Egzersizi Durdur" : "Nefes Egzersizini Başlat"}
                </button>
              </div>
            </div>

            {/* Sağ: Günlük Su & Mola Hatırlatıcı + Kişisel Gelişim Notları */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Su & Mola Kartı */}
              <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-sky-500" />
                    <span>Günlük Su & Sağlık Takibi</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Bugün içilen su: <strong className="text-sky-600">{waterCount} Bardak</strong></p>
                </div>
                <button
                  onClick={addWater}
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition cursor-pointer active:scale-95"
                >
                  +1 Bardak İçtim
                </button>
              </div>

              {/* Günlük Ajanda & Yapılacaklar */}
              <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Bugünün Öncelikli Notları & Hedefleri</span>
                </h3>

                <form onSubmit={addTask} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Yeni bir iş veya kişisel hedef ekleyin..."
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">Henüz bir not eklenmedi.</div>
                  ) : (
                    tasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <button
                          onClick={() => toggleTask(t.id)}
                          className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                        >
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                          }`}>
                            {t.done && <Check className="h-3 w-3" />}
                          </div>
                          <span className={t.done ? "line-through text-slate-400 font-medium" : "text-slate-800 font-bold"}>
                            {t.text}
                          </span>
                        </button>
                        <button onClick={() => deleteTask(t.id)} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. BABANIN ÖZEL YÖNETİCİ & HESAPLAMA ÇALIŞMA ALANI */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Üst Karşılama Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-8 text-white shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md mb-2 border border-amber-500/30">
                  <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                  <span>Şirket Sahibi Yönetici Çalışma Masası</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">Hoş Geldiniz, {userName}</h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Resmi kurum portallarına hızlı erişim, anlık maliyet & KDV hesaplamaları ve günlük iş ajandanız tek ekranda hazır.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Günün Tarihi</div>
                <div className="text-sm font-black text-amber-300 mt-0.5">
                  {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Erişim Kurum Portalları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: "İSG-KÂTİP", desc: "Bakanlık Sözleşme Portalı", url: "https://isgkatip.csgb.gov.tr" },
              { title: "GİB İnteraktif VD", desc: "Fatura & Vergi İşlemleri", url: "https://ivd.gib.gov.tr" },
              { title: "SGK İşveren Sistemi", desc: "Çalışan & Bildirge Takibi", url: "https://uyg.sgk.gov.tr/IsverenSistemi" },
              { title: "Mevzuat Bilgi Sistemi", desc: "6331 Sayılı Kanun & Yönetmelikler", url: "https://www.mevzuat.gov.tr" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-[#d84315] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 group-hover:text-[#d84315] transition">
                      {item.title}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#d84315] transition" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-[#d84315] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Sisteme Git →
                </span>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sol: Pratik KDV & Fatura Hesaplayıcı */}
            <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#d84315]" />
                <span>Hızlı KDV & Fatura Hesaplayıcı</span>
              </h2>
              <p className="text-xs text-slate-500">
                Hizmet teklifi verirken veya fatura keserken KDV dahil/hariç ve 5/10 tevkifat tutarlarını anında görün.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tutar (TL)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="Örn: 10000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#d84315] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">KDV Oranı</label>
                  <select
                    value={calcKdvRate}
                    onChange={(e) => setCalcKdvRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value={20}>%20 (Genel Hizmet)</option>
                    <option value={10}>%10</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTevkifat}
                      onChange={(e) => setIncludeTevkifat(e.target.checked)}
                      className="rounded text-[#d84315]"
                    />
                    <span>5/10 Tevkifat Uygula</span>
                  </label>
                </div>
              </div>

              {/* Hesaplama Sonucu */}
              {calcAmount && Number(calcAmount) > 0 && (() => {
                const base = Number(calcAmount);
                const kdvVal = base * (calcKdvRate / 100);
                const tevkifatVal = includeTevkifat ? kdvVal * 0.5 : 0;
                const grandTotal = base + kdvVal - tevkifatVal;

                return (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Matrah (Net Tutar):</span>
                      <strong className="text-slate-900">₺{base.toLocaleString("tr-TR")}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Hesaplanan KDV (%{calcKdvRate}):</span>
                      <strong className="text-slate-900">₺{kdvVal.toLocaleString("tr-TR")}</strong>
                    </div>
                    {includeTevkifat && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span>Tevkif Edilen KDV (5/10):</span>
                        <span>-₺{tevkifatVal.toLocaleString("tr-TR")}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-[#d84315]">
                      <span>Tahsil Edilecek Genel Toplam:</span>
                      <span>₺{grandTotal.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Sağ: Günlük Yönetici Ajandası & Takip */}
            <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#d84315]" />
                <span>Yönetici Not Defteri & Görüşülecek Kişiler</span>
              </h2>

              <form onSubmit={addTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Görüşülecek firma, aranacak kişi veya iş..."
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-[#d84315] focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#d84315] text-white hover:bg-[#bf360c] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-8">Ajandanızda henüz kayıtlı bir iş bulunmuyor.</div>
                ) : (
                  tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                      >
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                          t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                        }`}>
                          {t.done && <Check className="h-3 w-3" />}
                        </div>
                        <span className={t.done ? "line-through text-slate-400 font-medium" : "text-slate-800 font-bold"}>
                          {t.text}
                        </span>
                      </button>
                      <button onClick={() => deleteTask(t.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}