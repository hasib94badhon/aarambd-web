"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  printing: "🖨️", security: "🔒", photography: "📷", media: "📺",
  event: "🎉", wedding: "💒", catering: "🍱",
};

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🏪";
}

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

function CategoryCard({ cat, idx }: { cat: Category; idx: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const gradient = GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length];

  return (
    <Link
      href={`/categories/${cat.cat_id}`}
      className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-44 block"
    >
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
          <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {getCategoryEmoji(cat.cat_name)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-sm leading-tight drop-shadow-sm">{cat.cat_name}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "service" | "shop">("all");

  useEffect(() => {
    publicApi
      .get("/category/get_categories_name")
      .then((r) => {
        setCategories(r.data.categories ?? []);
        setFiltered(r.data.categories ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = categories;
    if (tab === "service") list = list.filter((c) => c.yes_service === 1);
    if (tab === "shop") list = list.filter((c) => c.yes_shop === 1);
    if (query.trim())
      list = list.filter((c) =>
        c.cat_name.toLowerCase().includes(query.toLowerCase())
      );
    setFiltered(list);
  }, [query, tab, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">All Categories</h1>
        <p className="text-gray-500 mt-1">
          Browse {categories.length} categories across Bangladesh
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Filter categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "service", "shop"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                tab === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {t === "all" ? "All" : t === "service" ? "Services" : "Shops"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((cat, idx) => (
            <CategoryCard key={cat.cat_id} cat={cat} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
