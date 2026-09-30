"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Stethoscope, 
  CheckCircle2, 
  BookOpen, 
  Check, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  UserCheck, 
  Search,
  FileText
} from "lucide-react";

interface HealthReport {
  id: string;
  patient_name: string;
  tc_no: string;
  company_name: string;
  payment_method: "nakit" | "pos" | "cari";
  amount: number;
  notes: string;
  status: "bekliyor" | "alt_kat_tamamlandi" | "tamamlandi";
  report_date: string;
  required_tests?: string[];
  completed_tests?: string[];
}

interface TestGuide {
  id: string;
  title: string;
  category: string;
  instructions: string;
  notes?: string;
}

export default function UzmanPanelPage() {
  const [activeTab, setActiveTab] = useState<"rapor_kontrol" | "test_rehberi">("rapor_kontrol");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Raporlar & Kuyruk
  const [reports, setReports] = useState<HealthReport[]>([]);

  // Test Rehberi State
  const [testGuides, setTestGuides] = useState<TestGuide[]>([]);
  const [guideSearch, setGuideSearch] = useState("");
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");
  const [newInstructions, setNewInstructions] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Eksik Test Uyarı Modali
  const [missingTestsModal, setMissingTestsModal] = useState<{
    reportId: string;
    patientName: string;
    missing: string[];
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/giris-yap");
        return;
      }

      setCurrentUser(user);
      const isSuper = isSuperAdminEmail(user.email);
      setIsAdmin(isSuper);

      if (!isSuper) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, staff_role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin" && profile?.staff_role !== "alt_kat") {
          router.push("/");
          return;
        }
      }

      fetchReports();
      fetchGuides();
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function fetchReports() {
    const { data } = await supabase.from("health_reports").select("*").order("report_date", { ascending: false });
    setReports(data || []);
  }

  async function fetchGuides() {
    const { data } = await supabase.from("test_guides").select("*").order("title", { ascending: true });
    setTestGuides(data || []);
  }

  // Realtime Rapor Dinleme
  useEffect(() => {
    const channel = supabase
      .channel("uzman_live_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "health_reports" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const rec = payload.new as HealthReport;
          setReports((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as HealthReport;
          setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } else if (payload.eventType === "DELETE") {
          setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Test Kutucuğu Tıklama
  async function handleToggleTest(reportId: string, testName: string, currentCompleted: string[] = []) {
    let updated: string[] = [];
    if (currentCompleted.includes(testName)) {
      updated = currentCompleted.filter((t) => t !== testName);
    } else {
      updated = [...currentCompleted, testName];
    }

    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, completed_tests: updated } : r)));

    await supabase.from("health_reports").update({ completed_tests: updated }).eq("id", reportId);
  }

  // İşlem Tamamlandı Kontrolü
  function handleCheckAndComplete(report: HealthReport) {
    const required = report.required_tests || [];
    const completed = report.completed_tests || [];
    const missing = required.filter((t) => !completed.includes(t));

    if (missing.length > 0) {
      setMissingTestsModal({
        reportId: report.id,
        patientName: report.patient_name,
        missing: missing,
      });
      return;
    }

    finalizeAltKatSend(report.id);
  }

  async function finalizeAltKatSend(reportId: string) {
    await supabase.from("health_reports").update({ status: "alt_kat_tamamlandi" }).eq("id", reportId);
    setMissingTestsModal(null);
  }

  // Yeni Test Rehberi Ekleme (Sadece Admin)
  async function handleAddGuide(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim()) return;

    const { error } = await supabase.from("test_guides").insert([
      {
        title: newTitle.trim(),
        category: newCategory.trim() || "Genel",
        instructions: newInstructions.trim(),
        notes: newNotes.trim(),
      },
    ]);

    if (!error) {
      setNewTitle("");
      setNewInstructions("");
      setNewNotes("");
      setShowAddGuide(false);
      fetchGuides();
    }
  }

  async function handleDeleteGuide(id: string) {
    if (!confirm("Bu test rehberini silmek istediğinize emin misiniz?")) return;
    await supabase.from("test_guides").delete().eq("id", id);
    fetchGuides();
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-500">Yükleniyor...</div>;
  }

  const altKatBekleyenler = reports.filter((r) => r.status === "bekliyor");
  const filteredGuides = testGuides.filter((g) => 
    g.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.instructions.toLowerCase().includes(guideSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SOL: UZMAN SIDEBAR */}
        <aside className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Tetkik & Muayene</div>
              <h2 className="text-base font-black text-slate-900">Uzman Paneli</h2>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("rapor_kontrol")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "rapor_kontrol"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Sağlık Raporu Kontrol</span>
              </div>
              {altKatBekleyenler.length > 0 && (
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {altKatBekleyenler.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("test_rehberi")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "test_rehberi"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Test Rehberi</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="truncate">{currentUser?.user_metadata?.full_name || currentUser?.email}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              İnen hastaların tetkiklerini tamamlayıp yukarı sevk edebilir, test yönergelerine göz atabilirsiniz.
            </p>
          </div>
        </aside>

        {/* SAĞ: ÇALIŞMA ALANI */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: SAĞLIK RAPORU KONTROL */}
          {activeTab === "rapor_kontrol" && (
            <div className="rounded-3xl bg-white border border-blue-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Uzman Tetkik Sırası</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Sırada Bekleyen Hastalar & Tetkik Kontrolü</h2>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {altKatBekleyenler.length} Hasta Bekliyor
                </span>
              </div>

              {altKatBekleyenler.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  Şu anda sırada bekleyen hasta bulunmuyor. Muhasebeden yeni sevk açıldığında otomatik buraya düşecektir.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {altKatBekleyenler.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{new Date(item.report_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Sırada</span>
                        </div>
                        
                        <div>
                          <div className="text-base font-bold text-slate-900">{item.patient_name}</div>
                          <div className="text-xs font-mono text-slate-500">{item.tc_no}</div>
                          <div className="text-xs text-slate-700 mt-0.5">Firma: <strong>{item.company_name}</strong></div>
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                            Not: {item.notes}
                          </div>
                        )}

                        <div className="pt-2 border-t border-blue-100 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                            Yapılacak Tetkikler:
                          </span>
                          
                          {item.required_tests && item.required_tests.length > 0 ? (
                            item.required_tests.map((testName, i) => {
                              const isDone = item.completed_tests?.includes(testName);
                              return (
                                <label
                                  key={i}
                                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                                    isDone
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => handleToggleTest(item.id, testName, item.completed_tests)}
                                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span>{testName}</span>
                                </label>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">Tanımlı tetkik yok (Genel)</div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckAndComplete(item)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Check className="h-4 w-4" />
                        <span>İşlem Tamamlandı (Yukarıya Sevk)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEST REHBERİ */}
          {activeTab === "test_rehberi" && (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Sağlık Tetkikleri Uygulama Rehberi</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tetkiklerin doğru yapılması için yönergeler, hazırlık kuralları ve dikkat edilecek noktalar.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddGuide(!showAddGuide)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{showAddGuide ? "Formu Kapat" : "Yeni Test Yönergesi Ekle"}</span>
                  </button>
                )}
              </div>

              {/* ADMİN YENİ REHBER EKLEME FORMU */}
              {isAdmin && showAddGuide && (
                <form onSubmit={handleAddGuide} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Test / Muayene Adı *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Örn: Akciğer Grafisi (PA)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Örn: Radyoloji, Odyoloji, Laboratuvar"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nasıl Yapılır? (Adım Adım Yönerge) *</label>
                    <textarea
                      rows={3}
                      required
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      placeholder="1. Hasta pozisyonu... 2. Cihaz ayarı... 3. Çekim..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Önemli Not / Dikkat Edilecekler</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Örn: Hamilelik şüphesi durumunda yapılmaz."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddGuide(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-bold"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      Rehbere Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* ARAMA ÇUBUĞU */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  placeholder="Test yönergelerinde ara..."
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* REHBER KARTLARI LİSTESİ */}
              <div className="space-y-4">
                {filteredGuides.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Rehberde aradığınız kritere uygun test yönergesi bulunamadı.
                  </div>
                ) : (
                  filteredGuides.map((guide) => (
                    <div key={guide.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          <h3 className="text-sm font-bold text-slate-900">{guide.title}</h3>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {guide.category}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteGuide(guide.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Rehberden Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pl-4 border-l-2 border-blue-300">
                        {guide.instructions}
                      </div>

                      {guide.notes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Dikkat:</strong> {guide.notes}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EKSİK TEST UYARI MODALİ */}
      {missingTestsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-amber-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-2xl bg-amber-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">İşaretlenmemiş Testler Var!</h3>
                <p className="text-xs text-slate-500">{missingTestsModal.patientName} için eksik testler:</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              {missingTestsModal.missing.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-bold">
                  <span>•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bu testleri yapmadınız veya işaretlemediniz. Yine de hastayı muhasebeye göndermek istediğinize emin misiniz?
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMissingTestsModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Geri Dön (Testi Yap)
              </button>
              <button
                type="button"
                onClick={() => finalizeAltKatSend(missingTestsModal.reportId)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
              >
                Evet, Yine de Gönder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}