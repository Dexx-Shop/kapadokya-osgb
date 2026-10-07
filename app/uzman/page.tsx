"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdminEmail } from "@/lib/constants";
import { 
  Stethoscope, 
  BookOpen, 
  Plus, 
  Trash2, 
  UserCheck, 
  Search, 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  FileSpreadsheet, 
  Send, 
  ChevronDown,
  AlertTriangle
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  recommended_price: number;
  tests: string[];
}

interface TestGuide {
  id: string;
  title: string;
  category: string;
  instructions: string;
  notes?: string;
}

export default function UzmanPanelPage() {
  const [activeTab, setActiveTab] = useState<"rapor_girisi" | "test_rehberi">("rapor_girisi");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firmalar
  const [companies, setCompanies] = useState<Company[]>([]);

  // Rapor Giriş Formu State'leri
  const [patientName, setPatientName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "cari">("nakit");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Test Rehberi State
  const [testGuides, setTestGuides] = useState<TestGuide[]>([]);
  const [guideSearch, setGuideSearch] = useState("");
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");
  const [newInstructions, setNewInstructions] = useState("");
  const [newNotes, setNewNotes] = useState("");

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

      fetchCompanies();
      fetchGuides();
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function fetchCompanies() {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });
    setCompanies(data || []);
  }

  async function fetchGuides() {
    const { data } = await supabase
      .from("test_guides")
      .select("*")
      .order("title", { ascending: true });
    setTestGuides(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSelectCompany(compId: string) {
    setSelectedCompanyId(compId);
    if (compId === "diger") {
      setAmount("");
      return;
    }
    const found = companies.find((c) => c.id === compId);
    if (found && found.recommended_price) {
      setAmount(found.recommended_price.toString());
    }
  }

  // Rapor Kaydı Açma (Doğrudan sisteme işlenir)
  async function handleSendReport(e: React.FormEvent) {
    e.preventDefault();
    let finalCompanyName = "";
    let finalTests: string[] = [];

    if (selectedCompanyId === "diger") {
      if (!customCompanyName.trim()) {
        setReportMessage({ type: "error", text: "Lütfen firma adını yazınız." });
        return;
      }
      finalCompanyName = customCompanyName.trim();
      finalTests = ["Genel Tetkikler"];
    } else {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (!found) {
        setReportMessage({ type: "error", text: "Lütfen bir firma seçiniz." });
        return;
      }
      finalCompanyName = found.name;
      finalTests = found.tests || [];
    }

    if (!patientName.trim() || !tcNo.trim()) {
      setReportMessage({ type: "error", text: "Lütfen ad soyad ve TC kimlik alanlarını doldurun." });
      return;
    }

    setSubmittingReport(true);
    setReportMessage(null);

    const userName = currentUser.user_metadata?.full_name || currentUser.email;

    const { error } = await supabase.from("health_reports").insert([
      {
        patient_name: patientName.trim(),
        tc_no: tcNo.trim(),
        company_name: finalCompanyName,
        payment_method: paymentMethod,
        amount: Number(amount) || 0,
        notes: notes.trim(),
        status: "tamamlandi",
        report_date: new Date().toISOString(),
        created_by_name: userName,
        created_by_role: "alt_kat",
        required_tests: finalTests,
        completed_tests: finalTests,
      },
    ]);

    setSubmittingReport(false);

    if (error) {
      setReportMessage({ type: "error", text: "Hata: " + error.message });
    } else {
      setReportMessage({ type: "success", text: `${patientName} sağlık raporu kaydı sisteme işlendi!` });
      setPatientName("");
      setTcNo("");
      setSelectedCompanyId("");
      setCustomCompanyName("");
      setAmount("");
      setNotes("");
    }
  }

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
    return (
      <div className="fixed inset-0 z-[9999] bg-[#07090e] flex flex-col items-center justify-center text-white">
        <Sparkles className="h-8 w-8 animate-spin text-blue-400 mb-3" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Uzman İstasyonu Açılıyor...
        </span>
      </div>
    );
  }

  const filteredGuides = testGuides.filter((g) => 
    g.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
    g.instructions.toLowerCase().includes(guideSearch.toLowerCase())
  );
  const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07090e] text-slate-100 overflow-y-auto selection:bg-blue-500 selection:text-white">
      
      {/* ARKA PLAN IŞIK EFEKTLERİ */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ÜST MİNİ BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/paneller"
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs font-bold transition active:scale-95 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Personel Portalı'na Dön</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-blue-400" />
            <span>Uzman Tetkik & Muayene İstasyonu</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
            <UserCheck className="h-3.5 w-3.5 text-blue-400" />
            <span className="truncate max-w-[140px]">{currentUser?.user_metadata?.full_name || currentUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Oturumu Kapat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* İÇERİK MERKEZİ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* SOL: UZMAN SIDEBAR */}
        <aside className="lg:col-span-3 rounded-3xl bg-white/[0.03] border border-blue-500/20 p-5 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">Tetkik & Muayene</div>
              <h2 className="text-base font-black text-white">Uzman Paneli</h2>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("rapor_girisi")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "rapor_girisi"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Sağlık Raporu Girişi</span>
            </button>

            <button
              onClick={() => setActiveTab("test_rehberi")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "test_rehberi"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Test Rehberi</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Muayenesi tamamlanan hastaların rapor girişini yapabilir ve test uygulama yönergelerine göz atabilirsiniz.
            </p>
          </div>
        </aside>

        {/* SAĞ: ÇALIŞMA ALANI */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: SAĞLIK RAPORU GİRİŞİ */}
          {activeTab === "rapor_girisi" && (
            <div className="rounded-3xl bg-white/[0.03] border border-blue-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Yeni Sağlık Raporu Girişi</h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date().toLocaleDateString("tr-TR")} {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {reportMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold border ${
                  reportMessage.type === "success" 
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                    : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                }`}>
                  {reportMessage.text}
                </div>
              )}

              <form onSubmit={handleSendReport} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Kişinin Adı Soyadı *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">T.C. Kimlik No *</label>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      value={tcNo}
                      onChange={(e) => setTcNo(e.target.value)}
                      placeholder="11 haneli kimlik no"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Çalışacağı Firma / Yer *</label>
                    <div className="relative">
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => handleSelectCompany(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-400 focus:outline-none transition shadow-sm cursor-pointer pr-8"
                      >
                        <option value="">-- Firma Seçiniz --</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.recommended_price ? `(Tavsiye: ₺${c.recommended_price})` : ""}
                          </option>
                        ))}
                        <option value="diger">➕ Listede Yok (Elle Giriş / Şahıs)</option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {selectedCompanyId === "diger" && (
                      <input
                        type="text"
                        required
                        placeholder="Firma / İşyeri Adını Yazınız"
                        value={customCompanyName}
                        onChange={(e) => setCustomCompanyName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {selectedCompanyObj && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="font-bold text-blue-300">İstenen Tetkikler: </span>
                        <span className="text-slate-200 font-medium">
                          {selectedCompanyObj.tests?.length ? selectedCompanyObj.tests.join(" • ") : "Standart Tetkikler"}
                        </span>
                      </div>
                    </div>
                    {selectedCompanyObj.recommended_price > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-slate-400">Tavsiye Edilen: </span>
                        <strong className="text-emerald-400 font-black text-sm">₺{selectedCompanyObj.recommended_price}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Ödeme Alınma Biçimi *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-400 focus:outline-none transition shadow-sm"
                    >
                      <option value="nakit">💵 Nakit</option>
                      <option value="pos">💳 POS / Kredi Kartı</option>
                      <option value="cari">📑 Cari (Firma Hesabı)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tahsil Edilecek Tutar (TL)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Ek Not (Varsa)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Örn: Rapor ve tetkik notları..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition shadow-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submittingReport ? "Kaydediliyor..." : "Rapor Kaydını Tamamla"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: TEST REHBERİ */}
          {activeTab === "test_rehberi" && (
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <span>Sağlık Tetkikleri Uygulama Rehberi</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tetkiklerin doğru yapılması için yönergeler, hazırlık kuralları ve dikkat edilecek noktalar.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddGuide(!showAddGuide)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{showAddGuide ? "Formu Kapat" : "Yeni Test Yönergesi Ekle"}</span>
                  </button>
                )}
              </div>

              {/* ADMİN YENİ REHBER EKLEME FORMU */}
              {isAdmin && showAddGuide && (
                <form onSubmit={handleAddGuide} className="p-4 rounded-2xl bg-white/5 border border-blue-500/30 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Test / Muayene Adı *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Örn: Akciğer Grafisi (PA)"
                        className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Örn: Radyoloji, Odyoloji, Laboratuvar"
                        className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nasıl Yapılır? (Adım Adım Yönerge) *</label>
                    <textarea
                      rows={3}
                      required
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      placeholder="1. Hasta pozisyonu... 2. Cihaz ayarı... 3. Çekim..."
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Önemli Not / Dikkat Edilecekler</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Örn: Hamilelik şüphesi durumunda yapılmaz."
                      className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddGuide(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-white/15 text-xs text-slate-300 font-bold hover:bg-white/5"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
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
                  className="w-full rounded-2xl bg-white/5 border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* REHBER KARTLARI LİSTESİ */}
              <div className="space-y-4">
                {filteredGuides.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Rehberde aradığınız kritere uygun test yönergesi bulunamadı.
                  </div>
                ) : (
                  filteredGuides.map((guide) => (
                    <div key={guide.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          <h3 className="text-sm font-bold text-white">{guide.title}</h3>
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                            {guide.category}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteGuide(guide.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                            title="Rehberden Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-4 border-l-2 border-blue-500/50">
                        {guide.instructions}
                      </div>

                      {guide.notes && (
                        <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
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

    </div>
  );
}