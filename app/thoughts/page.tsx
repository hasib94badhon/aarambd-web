"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Lightbulb,
  User,
  Eye,
  MessageCircle,
  X,
  Send,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
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

interface ThoughtDetail {
  des_id: number;
  des: string;
  des_photo: string;
  des_view: number;
  time: string;
  des_cat: string;
  user_id: number;
  user_name: string;
  user_photo: string;
  cat_name: string;
  des_com: number;
}

interface Comment {
  com_id: number;
  com_text: string;
  com_time: string;
  user_id: number;
  commenter_name: string;
  photo: string;
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

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  // Fetch categories
  useEffect(() => {
    if (!hydrated || !isLoggedIn) {
      setCatsLoading(false);
      return;
    }
    api
      .get("/get_description_categories")
      .then((r) => {
        const cats: DesCategory[] = r.data.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) setActiveCat(cats[0].des_cat_id);
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, [hydrated, isLoggedIn]);

  // Fetch thoughts when category changes
  useEffect(() => {
    if (!activeCat) return;
    setLoading(true);
    setPage(1);
    setThoughts([]);
    api
      .get("/get_description_by_cat", { params: { des_cat_id: activeCat, page: 1, page_size: PAGE_SIZE } })
      .then((r) => {
        const items: Thought[] = r.data.descriptions ?? [];
        setThoughts(items);
        setHasMore(items.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCat]);

  const loadMore = async () => {
    if (!activeCat) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const r = await api.get("/get_description_by_cat", {
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

  if (!hydrated) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center">
          <Lightbulb size={24} className="text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Thoughts &amp; Needs</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Login to browse thoughts and needs posted by the community.
        </p>
        <Link href="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
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
              <ThoughtCard key={t.des_id} thought={t} onClick={() => setSelectedId(t.des_id)} />
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
      className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden group"
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
          <span className="ml-auto flex items-center gap-0.5 text-blue-600 font-medium group-hover:gap-1.5 transition-all">
            View <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function ThoughtDetailSheet({
  desId,
  user,
  onClose,
}: {
  desId: number;
  user: { user_id: number; name: string } | null;
  onClose: () => void;
}) {
  const [thought, setThought] = useState<ThoughtDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/get_thought", { params: { des_id: desId } }),
      api.get("/get_thought_comments", { params: { des_id: desId, page: 1, page_size: 20 } }),
    ])
      .then(([tRes, cRes]) => {
        setThought(tRes.data.thought);
        setComments(cRes.data.comments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Track view
    if (user) {
      api.post("/increase_thought_view", { user_id: user.user_id, des_id: desId }).catch(() => {});
    }
  }, [desId, user]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setSubmitting(true);
    try {
      await api.post("/submit_thought", {
        com_user_id: user.user_id,
        des_id: desId,
        com_text: commentText.trim(),
      });
      setComments((prev) => [
        {
          com_id: Date.now(),
          com_text: commentText.trim(),
          com_time: new Date().toLocaleString(),
          user_id: user.user_id,
          commenter_name: user.name,
          photo: "",
        },
        ...prev,
      ]);
      setCommentText("");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Thought</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : thought ? (
            <div className="p-5">
              {thought.des_photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thought.des_photo}
                  alt=""
                  className="w-full rounded-xl object-cover max-h-52 mb-4"
                />
              )}

              {/* Author */}
              <Link
                href={`/profile/${thought.user_id}`}
                className="flex items-center gap-2 mb-3 hover:opacity-75 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {thought.user_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thought.user_photo} alt={thought.user_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={13} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{thought.user_name}</p>
                  <p className="text-xs text-gray-400">{thought.cat_name}</p>
                </div>
              </Link>

              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mb-4">{thought.des}</p>

              <div className="flex gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Eye size={11} /> {thought.des_view}</span>
                <span className="flex items-center gap-1"><MessageCircle size={11} /> {comments.length} comments</span>
                <span className="ml-auto">{thought.time}</span>
              </div>

              <Separator className="mb-4" />

              {/* Comments */}
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Comments</h3>
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No comments yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.com_id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {c.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.photo} alt={c.commenter_name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={11} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-800">{c.commenter_name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{c.com_text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 text-center text-sm text-gray-400">Unable to load thought.</div>
          )}
        </div>

        {/* Comment form */}
        {user && (
          <div className="border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
