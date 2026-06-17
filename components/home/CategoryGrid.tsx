"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";
import { Category } from "@/lib/types";

const EMOJI_MAP: Record<string, string> = {
  restaurant: "🍽️", food: "🍽️", cafe: "☕", bakery: "🥐",
  hospital: "🏥", healthcare: "🏥", doctor: "👨‍⚕️", clinic: "🏥", pharmacy: "💊", dental: "🦷",
  school: "🏫", education: "📚", tutor: "📖", college: "🎓", university: "🎓",
  construction: "🏗️", contractor: "🏗️", builder: "🏗️",
  electronics: "📱", mobile: "📱", computer: "💻", it: "💻", technology: "💻", tech: "💻",
  legal: "⚖️", lawyer: "⚖️", law: "⚖️",
  transport: "🚗", car: "🚗", vehicle: "🚗", driver: "🚕",
  beauty: "💇", salon: "💅", spa: "🧖", cosmetic: "💄",
  real: "🏠", estate: "🏠", property: "🏘️", house: "🏠",
  clothing: "👗", fashion: "👔", garment: "👗", tailor: "🧵",
  finance: "💰", bank: "🏦", insurance: "📋", accounting: "📊",
  plumber: "🔧", plumbing: "🔧", electrician: "⚡", electric: "⚡",
  grocery: "🛒", supermarket: "🛒", market: "🛒",
  hotel: "🏨", travel: "✈️", tourism: "🗺️",
  gym: "💪", fitness: "🏋️", sport: "⚽",
  agriculture: "🌾", farming: "🌱", plant: "🌿",
  furniture: "🛋️", interior: "🏠", design: "🎨",
  printing: "🖨️", stationary: "📝",
  security: "🔒", photography: "📷", media: "📺",
  event: "🎉", wedding: "💒", catering: "🍱",
};

const GRADIENT_PAIRS = [
  "from-green-500 to-emerald-700",
  "from-blue-500 to-indigo-700",
  "from-orange-400 to-red-600",
  "from-purple-500 to-violet-700",
  "from-teal-400 to-cyan-600",
  "from-pink-500 to-rose-700",
  "from-amber-400 to-orange-600",
  "from-lime-500 to-green-700",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-purple-700",
  "from-red-400 to-pink-600",
  "from-cyan-400 to-teal-600",
];

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🏪";
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/category/get_categories_name")
      .then((r: { data: { categories?: Category[] } }) => setCategories(r.data.categories?.slice(0, 12) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Browse Categories</h2>
            <p className="text-gray-500 mt-1 text-sm">Find what you need by category</p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <StaticCategories />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <CategoryCard key={cat.cat_id} cat={cat} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ cat, idx }: { cat: Category; idx: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const gradient = GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length];

  return (
    <Link
      href={`/categories/${cat.cat_id}`}
      className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-40 block"
    >
      {/* Background — real image or gradient + emoji */}
      {cat.cat_logo && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cat.cat_logo}
          alt={cat.cat_name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {getCategoryEmoji(cat.cat_name)}
          </span>
        </div>
      )}

      {/* Gradient overlay — dark at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Floating name + badges */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight drop-shadow-sm">
          {cat.cat_name}
        </p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {cat.yes_service === 1 && (
            <span className="text-[10px] bg-white/25 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
              Service
            </span>
          )}
          {cat.yes_shop === 1 && (
            <span className="text-[10px] bg-white/25 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
              Shop
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

const STATIC = [
  { label: "Restaurant & Food", emoji: "🍽️", gradient: "from-orange-400 to-red-600" },
  { label: "Healthcare", emoji: "🏥", gradient: "from-blue-400 to-indigo-600" },
  { label: "Education", emoji: "📚", gradient: "from-purple-500 to-violet-700" },
  { label: "Construction", emoji: "🏗️", gradient: "from-amber-400 to-orange-600" },
  { label: "Electronics", emoji: "📱", gradient: "from-sky-400 to-blue-600" },
  { label: "Legal Services", emoji: "⚖️", gradient: "from-gray-600 to-gray-800" },
  { label: "Transport", emoji: "🚗", gradient: "from-teal-400 to-cyan-600" },
  { label: "Beauty & Salon", emoji: "💇", gradient: "from-pink-500 to-rose-600" },
  { label: "Real Estate", emoji: "🏠", gradient: "from-green-500 to-emerald-700" },
  { label: "Clothing", emoji: "👗", gradient: "from-fuchsia-500 to-purple-700" },
  { label: "IT & Technology", emoji: "💻", gradient: "from-cyan-500 to-blue-700" },
  { label: "Finance", emoji: "💰", gradient: "from-lime-500 to-green-700" },
];

function StaticCategories() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {STATIC.map((c) => (
        <Link
          key={c.label}
          href="/categories"
          className={`group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-40 block bg-gradient-to-br ${c.gradient}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
              {c.emoji}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{c.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
