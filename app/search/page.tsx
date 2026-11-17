"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Eye, Phone, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import RightSidebar from "@/components/home/RightSidebar";
import { useAuthStore } from "@/store/authStore";
import { publicApi } from "@/lib/api";

interface SearchUser {
  user_id: number;
  name: string;
  photo?: string;
  location?: string;
  description?: string;
  cat_name?: string;
  user_viewed: number;
  user_called: number;
  subscription_type?: string;
  service_id?: number | null;
  shop_id?: number | null;
  is_service?: boolean | null;
}

function resolveHref(u: SearchUser): string {
  if (u.is_service && u.service_id) return `/service/${u.service_id}`;
  if (u.is_service === false && u.shop_id) return `/shop/${u.shop_id}`;
  return `/profile/${u.user_id}`;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<SearchUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setTotal(0); return; }
    setLoading(true);
    publicApi
      .get("/search_users", { params: { q, page: 1, page_size: 30 } })
      .then((r) => { setResults(r.data.users ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => { setResults([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex gap-4 items-start">
        <main className="flex-1 min-w-0">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses, services, categories…"
            className="pl-9 rounded-full h-11"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-[#6C78DF] hover:bg-[#5A64D4] text-white rounded-full text-sm font-semibold transition"
        >
          Search
        </button>
      </form>

      {/* Status line */}
      {q && !loading && (
        <p className="text-sm text-gray-500 mb-6">
          {total > 0
            ? <><span className="font-semibold text-gray-900">{total}</span> result{total !== 1 ? "s" : ""} for &quot;{q}&quot;</>
            : <>No results for &quot;{q}&quot;</>
          }
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 && q ? (
        /* Empty state */
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium text-gray-600">No results found for &quot;{q}&quot;</p>
          <p className="text-sm mt-2 mb-6">Try a different search term or browse by category</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C78DF] text-white rounded-xl text-sm font-semibold hover:bg-[#5A64D4] transition"
          >
            Browse All Categories
          </Link>
        </div>
      ) : results.length === 0 ? (
        /* No query yet */
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔎</div>
          <p className="text-lg font-medium text-gray-600">Search for anything</p>
          <p className="text-sm mt-1">Find businesses, services, and professionals across Bangladesh</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Plumber", "Restaurant", "Doctor", "Electrician", "Lawyer", "Contractor"].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-[#6C78DF]/10 hover:text-[#30337A] text-gray-600 rounded-full text-sm transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((u) => (
            <ResultCard key={u.user_id} user={u} />
          ))}
        </div>
      )}
        </main>

        <RightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}

function ResultCard({ user }: { user: SearchUser }) {
  const href = resolveHref(user);
  const isPaid = user.subscription_type === "paid";

  return (
    <Link href={href}>
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#6C78DF]/10 flex-shrink-0 flex items-center justify-center">
          {user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 group-hover:text-[#30337A] transition truncate text-sm">
              {user.name}
            </h3>
            {isPaid && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Pro</span>}
            {user.cat_name && <CheckCircle2 size={13} className="text-[#6C78DF] flex-shrink-0" />}
          </div>

          {user.cat_name && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">
              {user.cat_name}
            </Badge>
          )}

          {user.location && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
              <MapPin size={10} /> {user.location}
            </p>
          )}

          {user.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {user.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye size={10} /> {user.user_viewed}</span>
            <span className="flex items-center gap-1"><Phone size={10} /> {user.user_called}</span>
            {user.is_service != null && (
              <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${
                user.is_service ? "bg-[#6C78DF]/10 text-[#30337A]" : "bg-orange-50 text-orange-600"
              }`}>
                {user.is_service ? "Service" : "Shop"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
