"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function CategoryIndexSidebar({ activeId }: { activeId?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_categories_name")
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="hidden lg:block sticky top-20 self-start w-[240px] shrink-0 max-h-[calc(100vh-5.5rem)] overflow-y-auto bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="px-3.5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 border-b border-slate-50 sticky top-0 bg-white">
        All Categories
      </div>
      <div className="p-2">
        {loading ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-lg" />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const isActive = activeId === String(cat.cat_id);
            return (
              <Link
                key={cat.cat_id}
                href={`/categories/${cat.cat_id}`}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition truncate ${
                  isActive
                    ? "bg-[#6C78DF]/10 text-[#30337A] font-semibold"
                    : "text-slate-700 hover:bg-[#6C78DF]/10 hover:text-[#30337A]"
                }`}
              >
                {cat.cat_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.cat_logo} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                ) : (
                  <span className="text-sm flex-shrink-0">{getCategoryEmoji(cat.cat_name)}</span>
                )}
                <span className="truncate">{cat.cat_name}</span>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
