"use client";

import { useState } from "react";
import { Images, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface PostItem {
  post_id: string;
  post_media: string[];
}

interface GalleryImage {
  url: string;
  postId: string;
}

export default function Gallery({ posts }: { posts: PostItem[] }) {
  const images: GalleryImage[] = posts.flatMap((p) =>
    (p.post_media ?? []).filter(Boolean).map((url) => ({ url, postId: p.post_id }))
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
        <Images className="mx-auto text-slate-300 mb-3" size={32} />
        <p className="text-sm font-medium text-slate-500">No photos yet</p>
        <p className="text-xs text-slate-400 mt-1">Photos from your posts will appear here.</p>
      </div>
    );
  }

  const close = () => setActiveIndex(null);
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Images size={16} className="text-[#6C78DF]" /> Gallery
        </h2>
        <span className="text-xs text-slate-400">{images.length} photo{images.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {images.slice(0, 18).map((img, i) => (
          <button
            key={`${img.postId}-${i}`}
            onClick={() => setActiveIndex(i)}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          </button>
        ))}
      </div>

      {images.length > 18 && (
        <p className="text-xs text-slate-400 mt-3 text-center">
          +{images.length - 18} more in your posts below
        </p>
      )}

      {/* Lightbox */}
      {activeIndex !== null && (
        <div className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4" onClick={close}>
          <button onClick={close} className="absolute top-5 right-5 text-white/70 hover:text-white transition">
            <X size={26} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 sm:left-6 text-white/60 hover:text-white transition p-2"
          >
            <ChevronLeft size={30} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 sm:right-6 text-white/60 hover:text-white transition p-2"
          >
            <ChevronRight size={30} />
          </button>

          <div className="flex flex-col items-center gap-4 max-w-3xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeIndex].url}
              alt=""
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <a
              href={`#post-${images[activeIndex].postId}`}
              onClick={close}
              className="flex items-center gap-1.5 text-sm font-medium text-[#A5ACEB] hover:text-white transition"
            >
              View post <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
