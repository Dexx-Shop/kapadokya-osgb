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
      <div className="bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 mb-2">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <span>Kurumsal Entegrasyon</span>
          </div>
          <h1 className="text-2xl font-black text-white">Anlaşmalı Firmalar & Tetkik Tanımları</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tanımladığınız firmalar, tavsiye edilen fiyatlar ve testler Muhasebe ve Uzman panellerine anında yansır.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 text-right shrink-0">
          Toplam Firma: <strong className="text-purple-400 text-sm">{companies.length}</strong>
        </div>
      </div>

      {/* FİRMA EKLE / DÜZENLE KARTI */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {editingCompany ? <Edit2 className="h-4 w-4 text-purple-400" /> : <Plus className="h-4 w-4 text-purple-400" />}
            <span>{editingCompany ? `"${editingCompany.name}" Firmasını Düzenle` : "Yeni Anlaşmalı Firma Tanımla"}</span>
          </h2>
          {editingCompany && (
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
            >
              <X className="h-3.5 w-3.5" /> Vazgeç
            </button>
          )}
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Firma Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Nevşehir Şeker Fabrikası"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tavsiye Edilen Muayene/Paket Ücreti (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 1250"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₺</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              İstenen Sağlık Tetkikleri (Virgülle ayırarak yazın)
            </label>
            <textarea
              rows={2}
              value={testsInput}
              onChange={(e) => setTestsInput(e.target.value)}
              placeholder="Örn: Akciğer Grafisi, İşitme Testi (Odyometri), Tam Kan (Hemogram), EKG, Göz Muayenesi"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              * Uzman paneli personeli bu firmadan gelen hastada buradaki testleri tik kutucuğu (checkbox) olarak görecektir.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingCompany && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? "Kaydediliyor..." : editingCompany ? "Değişiklikleri Güncelle" : "Firmayı Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FİRMALAR LİSTESİ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white">Kayıtlı Anlaşmalı Firmalar</h3>
          
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firma ara..."
              className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold">Yükleniyor...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {searchTerm ? "Aradığınız kritere uygun firma bulunamadı." : "Henüz bir firma tanımlanmadı."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredCompanies.map((c) => (
              <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] p-3 rounded-2xl transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">{c.name}</span>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Tavsiye: ₺{c.recommended_price}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">İstenen Tetkikler:</span>
                    {c.tests && c.tests.length > 0 ? (
                      c.tests.map((t, i) => (
                        <span key={i} className="text-[11px] bg-white/5 text-slate-300 font-medium px-2 py-0.5 rounded-lg border border-white/10">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Genel muayene</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 transition shadow-sm cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition shadow-sm cursor-pointer"
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