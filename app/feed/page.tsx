"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFilterBar from "@/components/feed/CategoryFilterBar";
import SortBar, { SortOption } from "@/components/feed/SortBar";
import PostCard from "@/components/feed/PostCard";
import PostDetailSheet from "@/components/feed/PostDetailSheet";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Category, FeedPost } from "@/lib/types";

const PAGE_SIZE = 12;

export default function FeedPage() {
  const { isLoggedIn, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Auth check
  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  if (!hydrated) return null;
  if (!isLoggedIn) return <LoginPrompt />;
  return <Feed />;
}

// ─── Feed (authenticated) ────────────────────────────────────────────────────

function Feed() {
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
    api
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

        const { data } = await api.get("/get_today_post", { params });
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort bar */}
        <SortBar value={sort} onChange={setSort} total={posts.length} />

        {/* Initial skeleton */}
        {initialLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
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

        {/* Posts grid */}
        {!initialLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={`more-${i}`} />
            ))}
          </div>
        )}
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

// ─── Login Prompt ────────────────────────────────────────────────────────────

function LoginPrompt() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl">
        📰
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Sign in to view the Feed
        </h1>
        <p className="text-gray-500 max-w-sm">
          The AaramBD feed shows latest posts and updates from businesses and
          service providers across Bangladesh.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            <LogIn size={16} /> Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" className="px-6">
            Create Free Account
          </Button>
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Or browse{" "}
        <Link href="/categories" className="text-blue-600 hover:underline">
          categories
        </Link>{" "}
        without signing in
      </p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton className="w-full h-48 rounded-none" />
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
