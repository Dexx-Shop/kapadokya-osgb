"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Loader2, Sparkles, X } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
}

export default function GaleriPage() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      const supabase = createClient();
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      setPhotos(data || []);
      setLoading(false);
    }

    fetchGallery();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Hero Başlık */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#427fcb] via-[#6399dc] to-[#9ec6f2] pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#d84315] shadow-sm backdrop-blur-md mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Kapadokya OSGB Saha & Ofis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Fotoğraf Galerisi
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="text-white/60">—</span>
            <span className="text-amber-200 font-semibold">Galeri</span>
          </div>
        </div>
      </section>

      {/* Fotoğraf Grid Alanı */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-[#d84315]" />
              <span className="mt-3 text-xs font-bold text-slate-500">Galeri yükleniyor...</span>
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-16 text-center max-w-lg mx-auto">
              <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Galeri Güncelleniyor</h3>
              <p className="mt-1 text-xs text-slate-500">
                Yeni hizmet binalarımızın ve saha denetimlerimizin fotoğrafları çok yakında burada paylaşılacaktır.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhoto(item.image_url)}
                  className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer bg-slate-100"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title || "Kapadokya OSGB"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Büyük Önizleme Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in"
        >
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-slate-900 transition cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw] aspect-video w-[1000px] overflow-hidden rounded-3xl border border-white/20">
            <Image
              src={selectedPhoto}
              alt="Büyük Önizleme"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

    </main>
  );
}