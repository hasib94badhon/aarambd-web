"use client";

import { Clock, Flame, MessageCircle } from "lucide-react";

export type SortOption = "recent" | "most_viewed" | "most_commented";

interface Props {
  value: SortOption;
  onChange: (v: SortOption) => void;
  total?: number;
}

const OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "recent", label: "Recent", icon: <Clock size={14} /> },
  { value: "most_viewed", label: "Trending", icon: <Flame size={14} /> },
  { value: "most_commented", label: "Most Discussed", icon: <MessageCircle size={14} /> },
];

export default function SortBar({ value, onChange, total }: Props) {
  return (
    <div className="flex items-center justify-between mb-5">
      <p className="text-sm text-gray-400">
        {total !== undefined ? `${total} posts loaded` : ""}
      </p>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              value === o.value
                ? "bg-white text-[#30337A] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
