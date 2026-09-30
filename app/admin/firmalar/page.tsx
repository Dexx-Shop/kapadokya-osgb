"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Stethoscope, 
  Banknote, 
  Search,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  recommended_price: number;
  tests: string[];
  created_at?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State'leri
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [testsInput, setTestsInput] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });

    setCompanies(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);

    const testsArray = testsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingCompany) {
      const { error } = await supabase
        .from("companies")
        .update({
          name: name.trim(),
          recommended_price: Number(price) || 0,
          tests: testsArray,
        })
        .eq("id", editingCompany.id);

      if (!error) {
        setSuccessMessage(`${name} firması başarıyla güncellendi.`);
        resetForm();
        fetchCompanies();
      } else {
        alert("Hata: " + error.message);
      }
    } else {
      const { error } = await supabase.from("companies").insert([
        {
          name: name.trim(),
          recommended_price: Number(price) || 0,
          tests: testsArray,
        },
      ]);

      if (!error) {
        setSuccessMessage(`${name} firması başarıyla eklendi.`);
        resetForm();
        fetchCompanies();
      } else {
        alert("Hata: " + error.message);
      }
    }

    setSubmitting(false);
  }

  async function handleDelete(id: string, compName: string) {
    if (!confirm(`"${compName}" firmasını silmek istediğinize emin misiniz?`)) return;

    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (!error) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Hata: " + error.message);
    }
  }

  function startEdit(comp: Company) {
    setEditingCompany(comp);
    setName(comp.name);
    setPrice(comp.recommended_price ? comp.recommended_price.toString() : "");
    setTestsInput(comp.tests?.join(", ") || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingCompany(null);
    setName("");
    setPrice("");
    setTestsInput("");
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* ÜST BAŞLIK */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-xs font-bold text-[#d84315] mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>Kurumsal Entegrasyon Modülü</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Anlaşmalı Firmalar & Tetkik Tanımları
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Burada tanımladığınız firmalar, tavsiye edilen fiyatlar ve testler rapor girişinde ve alt kat ekranında otomatik görünür.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 text-right shrink-0">
          Toplam Firma: <strong className="text-[#d84315] text-sm">{companies.length}</strong>
        </div>
      </div>

      {/* FİRMA EKLE / DÜZENLE KARTI */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {editingCompany ? <Edit2 className="h-4 w-4 text-[#d84315]" /> : <Plus className="h-4 w-4 text-[#d84315]" />}
            <span>{editingCompany ? `"${editingCompany.name}" Firmasını Düzenle` : "Yeni Anlaşmalı Firma Tanımla"}</span>
          </h2>
          {editingCompany && (
            <button
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
            >
              <X className="h-3.5 w-3.5" /> Vazgeç
            </button>
          )}
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Firma Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Nevşehir Şeker Fabrikası"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tavsiye Edilen Muayene/Paket Ücreti (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 1250"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₺</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              İstenen Sağlık Tetkikleri (Virgülle ayırarak yazın)
            </label>
            <textarea
              rows={2}
              value={testsInput}
              onChange={(e) => setTestsInput(e.target.value)}
              placeholder="Örn: Akciğer Grafisi, İşitme Testi (Odyometri), Tam Kan (Hemogram), EKG, Göz Muayenesi"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none transition shadow-sm"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              * Alt kat personeli hastayı muayene ederken buraya yazdığınız her tetkik için ayrı onay kutucuğu (checkbox) görecektir.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingCompany && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Vazgeç
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#d84315] hover:bg-[#bf360c] text-white font-bold text-xs transition shadow-md shadow-[#d84315]/20 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? "Kaydediliyor..." : editingCompany ? "Değişiklikleri Güncelle" : "Firmayı Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FİRMALAR LİSTESİ */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">Kayıtlı Anlaşmalı Firmalar</h3>
          
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firma ara..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#d84315] focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold">Yükleniyor...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {searchTerm ? "Aradığınız kritere uygun firma bulunamadı." : "Henüz bir firma tanımlanmadı."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCompanies.map((c) => (
              <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{c.name}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      Tavsiye: ₺{c.recommended_price}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">İstenen Tetkikler:</span>
                    {c.tests && c.tests.length > 0 ? (
                      c.tests.map((t, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-lg border border-slate-200">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Genel muayene</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 transition shadow-sm cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition shadow-sm cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}