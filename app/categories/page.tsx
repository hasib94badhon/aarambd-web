"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryIndexSidebar from "@/components/categories/CategoryIndexSidebar";
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
  "from-[#6C78DF] to-[#30337A]",
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
      .get("/get_categories_name")
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
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* Banner */}
      <div className="relative rounded-[28px] overflow-hidden mb-6 shadow-2xl shadow-[#6C78DF]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 40%, #ffffff 40%, #ffffff 41%, transparent 41%), linear-gradient(135deg, transparent 60%, #ffffff 60%, #ffffff 61%, transparent 61%)",
            backgroundSize: "200px 200px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-[#6C78DF]/30 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative p-6 sm:p-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm">
              <LayoutGrid size={14} className="text-[#6C78DF]" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              Browse
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            All Categories
          </h1>
          <p className="text-sm sm:text-base text-white/70 mb-6">
            Browse {categories.length} categories of businesses and services across Bangladesh
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-0 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "service", "shop"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 h-11 rounded-xl text-sm font-medium transition border whitespace-nowrap ${
                    tab === t
                      ? "bg-white text-[#30337A] border-white"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                  }`}
                >
                  {t === "all" ? "All" : t === "service" ? "Services" : "Shops"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <CategoryIndexSidebar />

        {/* Main grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((cat, idx) => (
                <CategoryCard key={cat.cat_id} cat={cat} idx={idx} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
