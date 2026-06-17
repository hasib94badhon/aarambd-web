"use client";

import { useEffect, useState } from "react";
import { Eye, Clock, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Thought {
  des_id: number;
  des: string;
  time: string;
  des_cat_name: string;
  des_photo: string;
  des_view: number;
}

interface Props {
  userId: string;
}

const PAGE_SIZE = 10;

export default function MyThoughts({ userId }: Props) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    api
      .get("/get_user_description", {
        params: { user_id: userId, page: 1, page_size: PAGE_SIZE },
      })
      .then((r) => {
        const items: Thought[] = r.data.descriptions ?? [];
        setThoughts(items);
        setHasMore(items.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    try {
      const r = await api.get("/get_user_description", {
        params: { user_id: userId, page: next, page_size: PAGE_SIZE },
      });
      const items: Thought[] = r.data.descriptions ?? [];
      setThoughts((p) => [...p, ...items]);
      setPage(next);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (desId: number) => {
    try {
      await api.post("/delete_user_description", { des_id: desId });
      setThoughts((p) => p.filter((t) => t.des_id !== desId));
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (thoughts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">💭</div>
        <p className="text-gray-500 font-medium">No thoughts yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Share what you&apos;re looking for using the &ldquo;+ New Thought&rdquo; tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {thoughts.map((t) => (
        <ThoughtRow key={t.des_id} thought={t} onDelete={handleDelete} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2 px-8">
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ThoughtRow({ thought, onDelete }: { thought: Thought; onDelete: (id: number) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    await onDelete(thought.des_id);
    setDeleting(false);
  };

  const timeShort = thought.time?.split(" ").slice(1, 4).join(" ") ?? "";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex gap-0 sm:gap-4">
      {/* Thumbnail or placeholder */}
      {thought.des_photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thought.des_photo}
          alt=""
          className="w-24 sm:w-32 object-cover flex-shrink-0 hidden sm:block"
        />
      ) : (
        <div className="w-24 sm:w-32 bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center flex-shrink-0 hidden sm:flex">
          <ImageIcon size={24} className="text-yellow-200" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-1.5 min-w-0">
        {thought.des_cat_name && (
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {thought.des_cat_name}
          </span>
        )}
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">{thought.des}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-1">
          <span className="flex items-center gap-1"><Clock size={10} /> {timeShort}</span>
          <span className="flex items-center gap-1"><Eye size={10} /> {thought.des_view ?? 0}</span>
        </div>
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pr-4 gap-1">
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="p-2 text-gray-300 hover:text-red-500 transition rounded-lg"
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <div className="flex flex-col gap-1 items-center">
            <button
              onClick={doDelete}
              disabled={deleting}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 disabled:opacity-60"
            >
              {deleting ? <Loader2 size={11} className="animate-spin" /> : null}
              Delete
            </button>
            <button onClick={() => setConfirm(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
