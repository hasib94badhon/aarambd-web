"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Globe, PlayCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface SocialItem {
  id: number;
  name: string;
  cat: string;
  photo: string;
  link: string;
  visit_count: number;
  kind: "fb" | "yt";
}

export default function SocialPage() {
  const [items, setItems] = useState<SocialItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "fb" | "yt">("all");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      publicApi.get("/get_fb_page").catch(() => ({ data: { fb_page: [], categories: [] } })),
      publicApi.get("/get_yt_channels").catch(() => ({ data: { yt_channels: [], categories: [] } })),
    ])
      .then(([fb, yt]) => {
        const fbItems: SocialItem[] = (fb.data.fb_page ?? []).map((p: { page_id: number; name: string; cat: string; photo: string; link: string; visit_count: number }) => ({
          id: p.page_id, name: p.name, cat: p.cat, photo: p.photo, link: p.link, visit_count: p.visit_count ?? 0, kind: "fb" as const,
        }));
        const ytItems: SocialItem[] = (yt.data.yt_channels ?? []).map((c: { channel_id: number; name: string; cat: string; photo: string; link: string; visit_count: number }) => ({
          id: c.channel_id, name: c.name, cat: c.cat, photo: c.photo, link: c.link, visit_count: c.visit_count ?? 0, kind: "yt" as const,
        }));
        const all = [...fbItems, ...ytItems].sort((a, b) => b.visit_count - a.visit_count);
        setItems(all);
        setCategories(Array.from(new Set([...(fb.data.categories ?? []), ...(yt.data.categories ?? [])])).sort());
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((i) => i.kind === tab);
    if (selectedCat) list = list.filter((i) => i.cat === selectedCat);
    if (search.trim()) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [items, tab, selectedCat, search]);

  const trackVisit = (item: SocialItem) => {
    publicApi.post(item.kind === "fb" ? "/fb_page_visit" : "/yt_channel_visit", {
      [item.kind === "fb" ? "page_id" : "channel_id"]: item.id,
    }).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Social Spotlight</h1>
        <p className="text-gray-500 mt-1">
          Discover local businesses&apos; Facebook Pages and YouTube channels.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
              <div className="flex gap-2">
                {([
                  { key: "all", label: "All" },
                  { key: "fb", label: "Facebook" },
                  { key: "yt", label: "YouTube" },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-lg border transition ${
                      tab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Category</p>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-full rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCat(null)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      !selectedCat ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCat(selectedCat === c ? null : c)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition truncate ${
                        selectedCat === c ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels or pages…"
                className="pl-9 rounded-full text-sm"
              />
            </div>
            <p className="text-sm text-gray-400 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No channels or pages found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <a
                  key={`${item.kind}-${item.id}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackVisit(item)}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photo} alt="" className="w-full h-full object-cover" />
                    ) : item.kind === "fb" ? (
                      <Globe size={18} className="text-blue-600" />
                    ) : (
                      <PlayCircle size={18} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.cat} · {item.visit_count} visits</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
