"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFilterBar from "@/components/feed/CategoryFilterBar";
import SortBar, { SortOption } from "@/components/feed/SortBar";
import PostCard from "@/components/feed/PostCard";
import PostDetailSheet from "@/components/feed/PostDetailSheet";
import RightSidebar from "@/components/home/RightSidebar";
import { publicApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Category, FeedPost } from "@/lib/types";

const PAGE_SIZE = 10;

export default function FeedPage() {
  const { isLoggedIn, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  if (!hydrated) return null;
  return <Feed isLoggedIn={isLoggedIn} />;
}

// ─── Feed ────────────────────────────────────────────────────────────────────

function Feed({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isFetching = useRef(false);

  // Load categories once
  useEffect(() => {
    publicApi
      .get("/get_categories_name")
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(() => {});
  }, []);

  // Reset feed when filter/sort changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(false);
    setInitialLoading(true);
  }, [selectedCat, sort]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (isFetching.current || !hasMore) return;
      isFetching.current = true;
      setLoading(true);
      setError(false);

      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          page_size: PAGE_SIZE,
          sort_by: sort,
        };
        if (selectedCat !== null) params.cat_id = selectedCat;

        const { data } = await publicApi.get("/get_today_post", { params });
        const newPosts: FeedPost[] = data.most_update_post ?? [];

        setPosts((prev) =>
          pageNum === 1 ? newPosts : [...prev, ...newPosts]
        );
        setHasMore(newPosts.length === PAGE_SIZE);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setInitialLoading(false);
        isFetching.current = false;
      }
    },
    [selectedCat, sort, hasMore]
  );

  // Initial fetch + re-fetch on filter change
  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat, sort]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  const openPost = (post: FeedPost) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setActivePost(post);
    setSheetOpen(true);
  };

  return (
    <>
      {/* Sticky category filter bar */}
      <CategoryFilterBar
        categories={categories}
        selected={selectedCat}
        onChange={(id) => setSelectedCat(id)}
      />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="flex gap-4 items-start">
          <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
            {/* Sort bar */}
            <SortBar value={sort} onChange={setSort} total={posts.length} />

            {/* Initial skeleton */}
            {initialLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && !initialLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <p className="text-gray-400">Could not load posts.</p>
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(1)}
                  className="gap-2"
                >
                  <RefreshCw size={14} /> Try again
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!initialLoading && !error && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 font-medium">No posts in this category yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try another category or check back later
                </p>
              </div>
            )}

            {/* Posts — list view */}
            {!initialLoading && posts.length > 0 && (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.post_id} post={post} onClick={openPost} />
                  ))}
                </div>

                {/* Load more */}
                <div className="flex justify-center mt-10">
                  {hasMore ? (
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      className="px-8 gap-2"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Load more posts"
                      )}
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-400 py-4">
                      You&apos;ve seen all posts
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Loading more skeletons at bottom */}
            {loading && !initialLoading && (
              <div className="space-y-4 mt-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <PostCardSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}
          </main>

          <RightSidebar isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {/* Post detail sheet */}
      <PostDetailSheet
        post={activePost}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton className="w-full h-72 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
  );
}
