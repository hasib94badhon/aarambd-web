"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Eye, Phone, Share2, MapPin, MessageCircle,
  Clock, CheckCircle2, Navigation, Check, Bookmark, BookmarkCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api, publicApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import ReviewsSection from "@/components/profile/ReviewsSection";

interface Post {
  post_id: string;
  post_des: string;
  post_main_description: string;
  post_media: string[];
  post_time: string;
  post_viewed: number;
  comment_count: number;
}

interface BusinessData {
  service_id?: number;
  shop_id?: number;
  user_id: number;
  name: string;
  phone: string;
  location: string;
  description: string;
  photo: string;
  cat_name: string;
  cat_logo: string;
  user_viewed: number;
  user_called: number;
  user_shared: number;
  call_status: number;
  type?: string;
  distance: string;
  address: string;
  posts: Post[];
  total_posts: number;
}

type Mode = "service" | "shop";

interface Props {
  id: string;
  mode: Mode;
}

export default function BusinessDetailPage({ id, mode }: Props) {
  const { user, isLoggedIn } = useAuthStore();
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const paramKey = mode === "service" ? "service_id" : "shop_id";
  const dataKey = mode === "service" ? "service_data" : "shop_data";

  const fetchData = async (sort = sortBy) => {
    setLoading(true);
    try {
      const body = { login_user_id: user?.user_id ?? null };
      const caller = isLoggedIn ? api : publicApi;
      const r = await caller.post(
        `/get_service_or_shop_data?${paramKey}=${id}&sort_by=${sort}&page=1&page_size=10`,
        body
      );
      const items: BusinessData[] = r.data[dataKey] ?? [];
      if (items.length === 0) { setNotFound(true); return; }
      setData(items[0]);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode, isLoggedIn]);

  // Check saved status
  useEffect(() => {
    if (!isLoggedIn || !user || !data) return;
    if (String(user.user_id) === String(data.user_id)) return;
    api
      .get("/get_favorite_user_ids", { params: { user_id: user.user_id } })
      .then((r) => setSaved((r.data.favorite_user_ids ?? []).includes(data.user_id)))
      .catch(() => {});
  }, [isLoggedIn, user, data]);

  const handleSaveToggle = async () => {
    if (!user || !data) return;
    setSavingToggle(true);
    try {
      if (saved) {
        await api.post("/remove_from_favorite_users", { user_id: user.user_id, fav_users: data.user_id });
        setSaved(false);
      } else {
        await api.post("/add_to_favorite_users", { user_id: user.user_id, fav_users: data.user_id });
        setSaved(true);
      }
    } catch { /* silent */ } finally { setSavingToggle(false); }
  };

  const handleCall = () => {
    if (data) publicApi.post("/update_calls", { user_id: data.user_id }).catch(() => {});
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: data?.name, url }); return; } catch { /* cancelled */ }
    }
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleSortChange = (s: string) => {
    setSortBy(s);
    fetchData(s);
  };

  if (loading) return <DetailSkeleton />;

  if (notFound || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Not Found</h2>
        <Link href={mode === "service" ? "/services" : "/businesses"} className="text-blue-600 hover:underline text-sm">
          Browse {mode === "service" ? "Services" : "Businesses"}
        </Link>
      </div>
    );
  }

  const isSelf = isLoggedIn && String(user?.user_id) === String(data.user_id);
  const isPaid = data.type === "paid";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href={mode === "service" ? "/services" : "/businesses"}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to {mode === "service" ? "Services" : "Businesses"}
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-44 sm:h-64 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
          {isPaid && (
            <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Pro
            </span>
          )}
        </div>

        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-xl flex-shrink-0">
              {data.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-green-50">👤</div>
              )}
            </div>

            <div className="flex-1 pt-2 sm:pt-10">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">{data.name}</h1>
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {data.cat_name && <Badge variant="secondary">{data.cat_name}</Badge>}
                <Badge variant="outline" className="capitalize">{mode}</Badge>
              </div>
              {data.location && (
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-2">
                  <MapPin size={13} /> {data.location}
                </p>
              )}
              {data.distance && data.distance !== "Distance not available" && (
                <p className="flex items-center gap-1 text-xs text-blue-600 mt-1 font-medium">
                  <Navigation size={11} /> {data.distance}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {data.call_status === 1 && (
                <a
                  href={`tel:${data.phone}`}
                  onClick={handleCall}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  <Phone size={15} /> Call
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                {copied ? <Check size={15} className="text-blue-600" /> : <Share2 size={15} />}
                {copied ? "Copied!" : "Share"}
              </button>
              {isLoggedIn && !isSelf && (
                <button
                  onClick={handleSaveToggle}
                  disabled={savingToggle}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition ${
                    saved
                      ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700"
                  }`}
                >
                  {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  {saved ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>

          {data.description && (
            <p className="mt-5 text-sm text-gray-600 leading-relaxed max-w-2xl">{data.description}</p>
          )}

          {data.address && data.address !== "Location not detected" && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
              <MapPin size={12} /> {data.address}
            </p>
          )}

          {/* Stats */}
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{data.user_viewed}</span> Views
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Phone size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{data.user_called}</span> Calls
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Share2 size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{data.user_shared}</span> Shares
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MessageCircle size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{data.total_posts}</span> Posts
            </div>
          </div>

          {/* Public profile link */}
          <div className="mt-4">
            <Link href={`/profile/${data.user_id}`} className="text-xs text-blue-600 hover:underline">
              View full profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Posts */}
      {data.posts?.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Posts & Updates</h2>
            <div className="flex gap-1">
              {["recent", "most_viewed", "most_commented"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSortChange(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    sortBy === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "recent" ? "Recent" : s === "most_viewed" ? "Most Viewed" : "Most Commented"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewsSection userId={String(data.user_id)} />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const img = Array.isArray(post.post_media) ? post.post_media[0] : undefined;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="post" className="w-full h-44 object-cover" />
      )}
      <div className="p-4">
        {post.post_main_description && (
          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{post.post_main_description}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{post.post_des}</p>
        <Separator className="my-3" />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock size={11} /> {post.post_time?.split(" ").slice(1, 4).join(" ")}</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Eye size={11} /> {post.post_viewed}</span>
            <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Skeleton className="h-5 w-24 mb-4" />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <Skeleton className="h-64 rounded-none" />
        <div className="px-6 pb-6 space-y-3 -mt-16">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
      </div>
    </div>
  );
}
