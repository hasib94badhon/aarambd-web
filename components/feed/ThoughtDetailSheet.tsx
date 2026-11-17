"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, Eye, MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

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

export default function ThoughtDetailSheet({
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
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
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

        {user && (
          <div className="border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6C78DF]/40"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || submitting}
                className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white px-3"
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
