"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb,
  User,
  Eye,
  MessageCircle,
  Loader2,
  ChevronRight,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CreateThought from "@/components/dashboard/CreateThought";
import ThoughtDetailSheet from "@/components/feed/ThoughtDetailSheet";
import RightSidebar from "@/components/home/RightSidebar";
import { publicApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface DesCategory {
  des_cat_id: number;
  des_cat_name: string;
}

interface Thought {
  des_id: number;
  des: string;
  time: string;
  des_cat_id: number;
  des_photo: string;
  des_view: number;
  user_id: number;
  user_name: string;
  photo: string;
  cat_name: string;
  des_com: number;
}

const PAGE_SIZE = 12;

export default function ThoughtsPage() {
  const { user, isLoggedIn, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [categories, setCategories] = useState<DesCategory[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(false);
  const [catsLoading, setCatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    publicApi
      .get("/get_description_categories")
      .then((r) => {
        const cats: DesCategory[] = r.data.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) setActiveCat(cats[0].des_cat_id);
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  const loadThoughts = () => {
    if (!activeCat) return;
    setLoading(true);
    setPage(1);
    setThoughts([]);
    publicApi
      .get("/get_description_by_cat", { params: { des_cat_id: activeCat, page: 1, page_size: PAGE_SIZE } })
      .then((r) => {
        const items: Thought[] = r.data.descriptions ?? [];
        setThoughts(items);
        setHasMore(items.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadThoughts, [activeCat]);

  const loadMore = async () => {
    if (!activeCat) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const r = await publicApi.get("/get_description_by_cat", {
        params: { des_cat_id: activeCat, page: nextPage, page_size: PAGE_SIZE },
      });
      const items: Thought[] = r.data.descriptions ?? [];
      setThoughts((prev) => [...prev, ...items]);
      setPage(nextPage);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  };

  const openDetail = (desId: number) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSelectedId(desId);
  };

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex gap-4 items-start">
      <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
          <Lightbulb size={20} className="text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Thoughts &amp; Needs</h1>
          <p className="text-sm text-gray-400">Browse what the community is looking for</p>
        </div>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-6">
        {composerOpen && isLoggedIn && user ? (
          <CreateThought
            userId={String(user.user_id)}
            defaultCatId={activeCat ?? undefined}
            onPublished={() => {
              setComposerOpen(false);
              loadThoughts();
            }}
          />
        ) : (
          <button
            onClick={() => (isLoggedIn ? setComposerOpen(true) : router.push("/login"))}
            className="w-full flex items-center gap-3 text-left px-2 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8990E8] to-[#30337A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {isLoggedIn && user ? user.name?.charAt(0).toUpperCase() ?? "?" : <User size={16} />}
            </div>
            <span className="flex-1 text-sm text-gray-400 bg-gray-50 rounded-full px-4 py-2.5">
              {isLoggedIn ? "Share a thought or need…" : "Sign in to share a thought or need…"}
            </span>
            <PenSquare size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      {catsLoading ? (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.des_cat_id}
              onClick={() => setActiveCat(cat.des_cat_id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                activeCat === cat.des_cat_id
                  ? "bg-[#6C78DF] text-white border-[#6C78DF]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#6C78DF]"
              }`}
            >
              {cat.des_cat_name}
            </button>
          ))}
        </div>
      )}

      {/* Thought grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No thoughts in this category yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {thoughts.map((t) => (
              <ThoughtCard key={t.des_id} thought={t} onClick={() => openDetail(t.des_id)} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2">
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
      </main>

      <RightSidebar isLoggedIn={isLoggedIn} />
      </div>

      {/* Detail sheet */}
      {selectedId !== null && (
        <ThoughtDetailSheet
          desId={selectedId}
          user={user}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function ThoughtCard({ thought, onClick }: { thought: Thought; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#6C78DF]/30 transition-all overflow-hidden group"
    >
      {thought.des_photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thought.des_photo} alt="" className="w-full h-36 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {thought.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thought.photo} alt={thought.user_name} className="w-full h-full object-cover" />
            ) : (
              <User size={12} className="text-gray-300" />
            )}
          </div>
          <span className="text-xs font-medium text-gray-600 truncate">{thought.user_name}</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">{thought.des}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye size={11} /> {thought.des_view ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={11} /> {thought.des_com ?? 0}</span>
          <span className="ml-auto flex items-center gap-0.5 text-[#6C78DF] font-medium group-hover:gap-1.5 transition-all">
            View <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}
