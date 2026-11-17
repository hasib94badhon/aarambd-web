"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DirectoryCard from "./DirectoryCard";
import { publicApi } from "@/lib/api";

interface CategoryCount {
  cat_id: string;
  name: string;
  count: number;
  photo?: string;
}

interface DirectoryUser {
  user_id: number;
  name: string;
  phone: string;
  location?: string;
  description?: string;
  photo?: string;
  cat_name?: string;
  cat_logo?: string;
  service_id?: number;
  shop_id?: number;
  is_service?: boolean | null;
  user_viewed?: number;
  user_called?: number;
  subscription_type?: string;
}

interface Props {
  title: string;
  subtitle: string;
  endpoint: string; // /get_shops_data or /get_service_data
  dataKey: string;  // shops_information or service_information
  categoryCountKey: string; // category_count
}

export default function DirectoryPage({ title, subtitle, endpoint, dataKey }: Props) {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .get(endpoint)
      .then((r: { data: Record<string, CategoryCount[] | DirectoryUser[]> }) => {
        setCategories((r.data.category_count as CategoryCount[]) ?? []);
        setUsers((r.data[dataKey] as DirectoryUser[]) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endpoint, dataKey]);

  const filtered = useMemo(() => {
    let list = users;
    if (selectedCat) list = list.filter((u) => u.cat_name === selectedCat);
    if (search.trim())
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.location?.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [users, selectedCat, search]);

  const selectedCatObj = categories.find(
    (c) => c.name === selectedCat
  );

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
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm">
              <Store size={14} className="text-[#6C78DF]" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              Browse
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">{title}</h1>
          <p className="text-sm sm:text-base text-white/70 mb-6">{subtitle}</p>

          <div className="relative max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location…"
              className="pl-10 h-11 rounded-xl border-0 bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — categories */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Filter by Category
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCat(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                    !selectedCat
                      ? "bg-[#6C78DF]/10 text-[#30337A] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>All</span>
                  <span className="text-xs text-gray-400">{users.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.cat_id}
                    onClick={() =>
                      setSelectedCat(selectedCat === cat.name ? null : cat.name)
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                      selectedCat === cat.name
                        ? "bg-[#6C78DF]/10 text-[#30337A] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{cat.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Result count */}
          <div className="flex items-center gap-3 mb-5">
            {selectedCat && (
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-800">{selectedCat}</span>
                {selectedCatObj && (
                  <span className="text-gray-400"> ({selectedCatObj.count})</span>
                )}
              </p>
            )}
            <p className="text-sm text-gray-400 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No listings found</p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-[#6C78DF] mt-2 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((u) => (
                <DirectoryCard key={u.service_id ?? u.shop_id ?? u.user_id} user={u} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
