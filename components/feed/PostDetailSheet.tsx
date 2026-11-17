"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Eye,
  MessageCircle,
  Clock,
  Send,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { FeedPost, FeedComment } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

interface Props {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
}

export default function PostDetailSheet({ post, open, onClose }: Props) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch full post media + comments when post changes
  useEffect(() => {
    if (!post || !open) return;

    setMediaIndex(0);
    setComments([]);
    setCommentText("");

    // Fetch full post for all media URLs
    api
      .get("/get_post", { params: { post_id: post.post_id } })
      .then((r) => {
        const p = r.data.post;
        const media = p.post_media
          ? (p.post_media as string).split(",").filter(Boolean)
          : post.photo
          ? [post.photo]
          : [];
        setAllMedia(media);
      })
      .catch(() => {
        setAllMedia(post.photo ? [post.photo] : []);
      });

    // Increment view count
    api.post("/increase_post_view", { post_id: post.post_id }).catch(() => {});

    // Fetch comments
    setCommentsLoading(true);
    api
      .get("/get_comments", { params: { post_id: post.post_id, page: 1, page_size: 30 } })
      .then((r) => setComments(r.data.comments ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [post, open]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post || !user) return;
    setSubmitting(true);
    try {
      await api.post("/submit_comment", {
        com_user_id: user.user_id,
        post_id: post.post_id,
        com_text: commentText.trim(),
      });
      // Optimistically add comment
      setComments((prev) => [
        ...prev,
        {
          com_id: Date.now(),
          com_text: commentText.trim(),
          com_time: new Date().toLocaleString(),
          user_id: user.user_id,
          photo: "",
          commenter_name: user.name,
        },
      ]);
      setCommentText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) return null;
  const timeShort = post.time?.split(" ").slice(1, 4).join(" ") ?? "";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-gray-500 hover:text-gray-900 shadow"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col h-full overflow-y-auto">
          {/* Media carousel */}
          {allMedia.length > 0 && (
            <div className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allMedia[mediaIndex]}
                alt="post media"
                className="w-full object-cover max-h-72"
              />
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                    disabled={mediaIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setMediaIndex((i) => Math.min(allMedia.length - 1, i + 1))
                    }
                    disabled={mediaIndex === allMedia.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {allMedia.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition ${
                          i === mediaIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-5 flex flex-col gap-4 flex-1">
            {/* Header */}
            <SheetHeader className="text-left p-0 space-y-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-[#6C78DF]" />
                </div>
                <div>
                  <Link
                    href={`/profile/${post.user_id}`}
                    onClick={onClose}
                    className="font-bold text-gray-900 hover:text-[#6C78DF] transition text-sm"
                  >
                    {post.name}
                  </Link>
                  {post.category && (
                    <div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {post.category}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              {post.main_description && (
                <SheetTitle className="text-base font-semibold text-gray-900 pt-3 leading-snug">
                  {post.main_description}
                </SheetTitle>
              )}
            </SheetHeader>

            {/* Description */}
            {post.photo_description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {post.photo_description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={11} /> {timeShort}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> {post.view} views
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={11} /> {post.comment_count} comments
              </span>
            </div>

            <Separator />

            {/* Comments section */}
            <div className="flex flex-col gap-3 flex-1">
              <h3 className="text-sm font-semibold text-gray-800">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>

              {commentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <Skeleton className="flex-1 h-12 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <CommentItem key={c.com_id} comment={c} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment input — pinned at bottom */}
        {user && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-[#6C78DF]" />
              </div>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#6C78DF]/40 transition"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="w-8 h-8 rounded-full bg-[#6C78DF] disabled:bg-gray-200 text-white flex items-center justify-center transition flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3 text-center text-xs text-gray-400">
            <Link href="/login" onClick={onClose} className="text-[#6C78DF] font-medium hover:underline">
              Login
            </Link>{" "}
            to leave a comment
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CommentItem({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
        {comment.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.photo} alt={comment.commenter_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={12} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-800">
            {comment.commenter_name}
          </span>
          <span className="text-[10px] text-gray-400">
            {comment.com_time?.split(" ").slice(1, 4).join(" ")}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{comment.com_text}</p>
      </div>
    </div>
  );
}
