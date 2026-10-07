"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    setPhotos(data || []);
    setLoading(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Lütfen bir fotoğraf seçin." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("gallery")
        .insert([{ title: title || "Kapadokya OSGB", image_url: publicUrl }]);

      if (dbError) throw dbError;

      setMessage({ type: "success", text: "Fotoğraf başarıyla yüklendi!" });
      setTitle("");
      setFile(null);
      loadPhotos();
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: "error", text: error.message || "Yükleme sırasında hata oluştu." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu fotoğrafı galeriden silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (!error) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Üst Başlık Kartı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 mb-2">
            <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>Medya & Albüm Modülü</span>
          </div>
          <h1 className="text-2xl font-black text-white">Galeri Fotoğraf Yönetimi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Anında galeriye yüksek kaliteli fotoğraf yükleyin veya yayından kaldırın.
          </p>
        </div>

        <Link
          href="/galeri"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition"
        >
          <span>Canlı Galeriyi Gör</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Fotoğraf Yükleme Kartı */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-purple-400" />
          <span>Yeni Fotoğraf Yükle</span>
        </h2>

        {message && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold border ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
              : "bg-rose-500/10 text-rose-300 border-rose-500/30"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Fotoğraf Başlığı / Açıklama (İsteğe Bağlı)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Nevşehir Şantiye Denetimi veya Hizmet Binamız"
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Görsel Seç (Kamera veya Dosya)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white hover:file:opacity-90 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Fotoğrafı Yayınla</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Yayındaki Fotoğraflar Listesi */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-400" />
          <span>Galeride Yayında Olan Fotoğraflar ({photos.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-xs text-slate-500">
            Henüz fotoğraf yüklenmemiş. Yukarıdaki formdan ilk görseli ekleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-sm hover:border-purple-400/50 transition">
                <div className="relative h-44 w-full bg-slate-900">
                  <Image
                    src={item.image_url}
                    alt={item.title || "Galeri"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex items-center justify-between bg-black/40 backdrop-blur-md">
                  <span className="text-xs font-bold text-white truncate pr-2">
                    {item.title}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Sil"
                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
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