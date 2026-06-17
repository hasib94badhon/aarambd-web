"use client";

import { useEffect, useRef } from "react";
import { LayoutGrid } from "lucide-react";
import { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  selected: number | null;
  onChange: (id: number | null) => void;
}

export default function CategoryFilterBar({ categories, selected, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view when selection changes
  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-active='true']") as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex gap-2 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {/* All tab */}
          <button
            data-active={selected === null}
            onClick={() => onChange(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              selected === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <LayoutGrid size={14} />
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.cat_id}
              data-active={selected === cat.cat_id}
              onClick={() => onChange(cat.cat_id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition border whitespace-nowrap ${
                selected === cat.cat_id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat.cat_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
