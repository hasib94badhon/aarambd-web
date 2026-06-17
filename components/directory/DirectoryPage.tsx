"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
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
                      ? "bg-blue-50 text-blue-700 font-medium"
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
                        ? "bg-blue-50 text-blue-700 font-medium"
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
          {/* Search */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or location…"
                className="pl-9 rounded-full text-sm"
              />
            </div>
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
                  className="text-sm text-blue-600 mt-2 hover:underline"
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
