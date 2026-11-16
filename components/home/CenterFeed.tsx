"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Eye,
  MessageCircle,
  Loader2,
  PenSquare,
  Store,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CreateThought from "@/components/dashboard/CreateThought";
import ThoughtDetailSheet from "@/components/feed/ThoughtDetailSheet";
import { publicApi } from "@/lib/api";

interface Thought {
  des_id: number;
  des: string;
  time: string;
  des_cat_id: number;
  des_sub_cat_id: number | null;
  sub_cat_name: string;
  sub_cat_emoji: string;
  des_photo: string;
  des_view: number;
  user_id: number;
  user_name: string;
  photo: string;
  cat_name: string;
  service_id: number;
  shop_id: number;
  is_service: boolean | null;
  des_com: number;
}

interface AuthUser {
  user_id: number;
  name: string;
}

const PAGE_SIZE = 10;

export default function CenterFeed({
  activeCat,
  activeSubCat,
  isLoggedIn,
  user,
}: {
  activeCat: number | null;
  activeSubCat: number | null;
  isLoggedIn: boolean;
  user: AuthUser | null;
}) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const router = useRouter();

  const load = () => {
    if (!activeCat) return;
    setLoading(true);
    setPage(1);
    publicApi
      .get("/get_description_by_cat", {
        params: { des_cat_id: activeCat, des_sub_cat_id: activeSubCat ?? undefined, page: 1, page_size: PAGE_SIZE },
      })
      .then((r: { data: { descriptions?: Thought[] } }) => {
        const items = r.data.descriptions ?? [];
        setThoughts(items);
        setHasMore(items.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeCat, activeSubCat]);

  const loadMore = async () => {
    if (!activeCat) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const r = await publicApi.get("/get_description_by_cat", {
        params: { des_cat_id: activeCat, des_sub_cat_id: activeSubCat ?? undefined, page: nextPage, page_size: PAGE_SIZE },
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

  return (
    <div className="flex-1 min-w-0 max-w-2xl mx-auto w-full flex flex-col gap-4">
      {/* Composer */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
        {composerOpen && isLoggedIn && user ? (
          <CreateThought
            userId={String(user.user_id)}
            defaultCatId={activeCat ?? undefined}
            onPublished={() => {
              setComposerOpen(false);
              load();
            }}
          />
        ) : (
          <button
            onClick={() => (isLoggedIn ? setComposerOpen(true) : router.push("/login"))}
            className="w-full flex items-center gap-3 text-left px-2 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {isLoggedIn && user ? user.name?.charAt(0).toUpperCase() ?? "?" : <User size={16} />}
            </div>
            <span className="flex-1 text-sm text-slate-400 bg-slate-50 rounded-full px-4 py-2.5">
              {isLoggedIn ? "Share a thought or need…" : "Sign in to share a thought or need…"}
            </span>
            <PenSquare size={18} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : thoughts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm text-center py-16 text-slate-400 text-sm">
          Nothing posted in this category yet.
        </div>
      ) : (
        <>
          {thoughts.map((t) => (
            <FeedCard key={t.des_id} thought={t} onOpen={() => openDetail(t.des_id)} />
          ))}
          {hasMore && (
            <div className="text-center pb-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2">
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {selectedId !== null && (
        <ThoughtDetailSheet desId={selectedId} user={user} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function FeedCard({ thought, onOpen }: { thought: Thought; onOpen: () => void }) {
  const businessHref =
    thought.is_service === true
      ? `/service/${thought.service_id}`
      : thought.is_service === false
      ? `/shop/${thought.shop_id}`
      : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 pb-0 flex items-start gap-3">
        <Link href={`/profile/${thought.user_id}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
            {thought.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thought.photo} alt={thought.user_name} className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-slate-300" />
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${thought.user_id}`} className="text-sm font-semibold text-slate-900 hover:underline">
            {thought.user_name}
          </Link>
          <div className="flex items-center flex-wrap gap-1.5 mt-0.5 text-xs text-slate-400">
            <span>{thought.time}</span>
            {thought.sub_cat_name && (
              <>
                <span>·</span>
                <span className="text-slate-500">
                  {thought.sub_cat_emoji} {thought.sub_cat_name}
                </span>
              </>
            )}
          </div>
        </div>
        {businessHref && (
          <Link
            href={businessHref}
            className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition"
          >
            <Store size={11} /> {thought.cat_name}
          </Link>
        )}
      </div>

      <button onClick={onOpen} className="block w-full text-left">
        <p className="px-4 pt-3 text-sm text-slate-800 leading-relaxed whitespace-pre-line line-clamp-5">
          {thought.des}
        </p>
        {thought.des_photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thought.des_photo} alt="" className="w-full max-h-96 object-cover mt-3" />
        )}
      </button>

      <div className="flex items-center gap-4 px-4 py-3 text-xs text-slate-400 border-t border-slate-50 mt-3">
        <span className="flex items-center gap-1"><Eye size={13} /> {thought.des_view ?? 0}</span>
        <button onClick={onOpen} className="flex items-center gap-1 hover:text-blue-600 transition">
          <MessageCircle size={13} /> {thought.des_com ?? 0} comments
        </button>
        <button onClick={onOpen} className="ml-auto flex items-center gap-0.5 text-blue-600 font-medium hover:gap-1.5 transition-all">
          View <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
