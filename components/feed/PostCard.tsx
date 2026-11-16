"use client";

import Link from "next/link";
import { Eye, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeedPost } from "@/lib/types";

interface Props {
  post: FeedPost;
  onClick: (post: FeedPost) => void;
}

export default function PostCard({ post, onClick }: Props) {
  const hasMedia = !!post.photo;
  const timeShort = post.time?.split(" ").slice(1, 4).join(" ") ?? "";

  return (
    <article
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => onClick(post)}
    >
      {/* Media */}
      {hasMedia ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.photo}
          alt={post.photo_description || "post image"}
          className="w-full h-64 sm:h-72 object-cover group-hover:brightness-95 transition"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
          <span className="text-4xl opacity-40">📝</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-green-100 flex-shrink-0 flex items-center justify-center border border-gray-100">
            {post.user_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.user_photo} alt={post.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">👤</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/profile/${post.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-gray-800 hover:text-[#6C78DF] transition truncate block"
            >
              {post.name}
            </Link>
            {post.category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">
                {post.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Main description */}
        {post.main_description && (
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {post.main_description}
          </p>
        )}

        {/* Photo description */}
        {post.photo_description && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {post.photo_description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeShort}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {post.view}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={11} /> {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
