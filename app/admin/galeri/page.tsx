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
  ExternalLink
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

  // Fotoğraf Yükle
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

  // Fotoğraf Sil
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Galeri Fotoğraf Yönetimi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Telefondan ya da bilgisayardan anında galeriye fotoğraf yükleyin veya yayından kaldırın.
          </p>
        </div>

        <Link
          href="/galeri"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
        >
          <span>Canlı Galeriyi Gör</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Fotoğraf Yükleme Kartı */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <UploadCloud className="h-5 w-5 text-[#d84315]" />
          <span>Yeni Fotoğraf Yükle</span>
        </h2>

        {message && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fotoğraf Başlığı / Açıklama (İsteğe Bağlı)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Nevşehir Şantiye Denetimi veya Hizmet Binamız"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 shadow-sm focus:border-[#d84315] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Görsel Seç (Kamera veya Galeri)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d84315] file:text-white hover:file:bg-[#bf360c] cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d84315] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#d84315]/25 hover:bg-[#bf360c] transition active:scale-95 disabled:opacity-60 cursor-pointer"
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-slate-600" />
          <span>Galeride Yayında Olan Fotoğraflar ({photos.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#d84315]" />
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-xs font-medium text-slate-500">
            Henüz fotoğraf yüklenmemiş. Yukarıdaki alandan ilk fotoğrafı yükleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((item) => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative h-44 w-full bg-slate-100">
                  <Image
                    src={item.image_url}
                    alt={item.title || "Galeri"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2.5 flex items-center justify-between bg-white">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">
                    {item.title}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Sil"
                    className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
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