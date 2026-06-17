"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { publicApi } from "@/lib/api";
import { FeedPost } from "@/lib/types";

export default function RecentPosts() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_today_post", { params: { page: 1, page_size: 6 } })
      .then((r: { data: { most_update_post?: FeedPost[] } }) =>
        setPosts(r.data.most_update_post ?? [])
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Latest Updates
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Recent posts from businesses and service providers
            </p>
          </div>
          <Link
            href="/feed"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-base font-medium">No posts yet</p>
            <p className="text-sm mt-1">Check back soon for the latest updates from local businesses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const timeShort = post.time?.split(" ").slice(1, 4).join(" ") ?? "";

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {post.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.photo}
          alt={post.photo_description}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl">
          📋
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {post.category && (
          <Badge variant="secondary" className="w-fit text-xs">
            {post.category}
          </Badge>
        )}
        {post.main_description && (
          <p className="text-sm font-semibold text-slate-900 line-clamp-1">
            {post.main_description}
          </p>
        )}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
          {post.photo_description}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-50 mt-auto">
          <span className="font-medium text-slate-600 truncate max-w-[120px]">
            {post.name ?? "Business"}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={11} /> {post.view ?? 0}</span>
            <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comment_count ?? 0}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {timeShort}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
