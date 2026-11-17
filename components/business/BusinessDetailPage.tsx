"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Eye, Phone, Share2, MapPin, MessageCircle,
  Clock, BadgeCheck, Crown, Navigation, Check, Bookmark, BookmarkCheck, QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api, publicApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import ReviewsSection from "@/components/profile/ReviewsSection";
import RightSidebar from "@/components/home/RightSidebar";

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
        <Link href={mode === "service" ? "/services" : "/businesses"} className="text-[#6C78DF] hover:underline text-sm">
          Browse {mode === "service" ? "Services" : "Businesses"}
        </Link>
      </div>
    );
  }

  const isSelf = isLoggedIn && String(user?.user_id) === String(data.user_id);
  const isPaid = data.type === "paid";

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex gap-4 items-start">
        <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full">
          <Link
            href={mode === "service" ? "/services" : "/businesses"}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6C78DF] mb-6 transition"
          >
            <ArrowLeft size={16} /> Back to {mode === "service" ? "Services" : "Businesses"}
          </Link>

          {/* V-card */}
          <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-[#6C78DF]/20 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF]" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, transparent 40%, #ffffff 40%, #ffffff 41%, transparent 41%), linear-gradient(135deg, transparent 60%, #ffffff 60%, #ffffff 61%, transparent 61%)",
                backgroundSize: "200px 200px",
              }}
            />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-[#6C78DF]/30 rounded-full blur-3xl" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative p-6 sm:p-8">
              {/* Brand row */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm">
                    <span className="text-[#6C78DF] font-black text-xs">A</span>
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
                    {mode === "service" ? "Service Card" : "Shop Card"}
                  </span>
                </div>
                {isPaid && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white bg-white/15 border border-white/25 rounded-full px-3 py-1">
                    <Crown size={12} /> Pro
                  </span>
                )}
              </div>

              {/* Main row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative flex-shrink-0 self-start">
                  <div className="w-28 h-28 rounded-2xl p-[2px] bg-white shadow-lg">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-[#30337A]">
                      {data.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-white/60">
                          {data.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#30337A] flex items-center justify-center">
                    <BadgeCheck size={14} className="text-[#6C78DF]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                    {data.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    {data.cat_name && (
                      <span className="text-sm font-medium text-white/80 italic">{data.cat_name}</span>
                    )}
                    <Badge variant="outline" className="capitalize border-white/25 text-white/80 text-[10px]">{mode}</Badge>
                    {data.location && (
                      <span className="flex items-center gap-1 text-xs text-white/55">
                        <MapPin size={12} /> {data.location}
                      </span>
                    )}
                  </div>
                  {data.distance && data.distance !== "Distance not available" && (
                    <p className="flex items-center gap-1 text-xs text-white/70 mt-1.5 font-medium">
                      <Navigation size={11} /> {data.distance}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {data.call_status === 1 && (
                    <a
                      href={`tel:${data.phone}`}
                      onClick={handleCall}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white hover:bg-white/90 text-[#30337A] rounded-xl px-4 py-2.5 transition whitespace-nowrap"
                    >
                      <Phone size={13} /> Call
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl px-4 py-2.5 transition whitespace-nowrap"
                  >
                    {copied ? <Check size={13} /> : <Share2 size={13} />}
                    {copied ? "Copied!" : "Share"}
                  </button>
                  {isLoggedIn && !isSelf && (
                    <button
                      onClick={handleSaveToggle}
                      disabled={savingToggle}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl px-4 py-2.5 transition whitespace-nowrap"
                    >
                      {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                      {saved ? "Saved" : "Save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {data.description && (
                <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-2xl border-l-2 border-white/25 pl-3">
                  {data.description}
                </p>
              )}

              {data.address && data.address !== "Location not detected" && (
                <p className="flex items-center gap-1.5 text-xs text-white/55 mt-3">
                  <MapPin size={12} /> {data.address}
                </p>
              )}

              <div className="mt-6 border-t border-white/15" />

              {/* Stats */}
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                {[
                  { icon: Eye, label: "Views", value: data.user_viewed },
                  { icon: Phone, label: "Calls", value: data.user_called },
                  { icon: Share2, label: "Shares", value: data.user_shared },
                  { icon: MessageCircle, label: "Posts", value: data.total_posts },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <s.icon size={14} className="text-white/70" />
                    <span className="text-base font-bold text-white tabular-nums">{s.value ?? 0}</span>
                    <span className="text-xs text-white/55">{s.label}</span>
                  </div>
                ))}
                <Link
                  href={`/profile/${data.user_id}`}
                  className="ml-auto flex items-center gap-1.5 text-[10px] text-white/70 hover:text-white tracking-widest uppercase transition"
                >
                  <QrCode size={12} />
                  Full profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Posts — list view, picture big, text below */}
          {data.posts?.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900">Posts &amp; Updates</h2>
                <div className="flex gap-1">
                  {["recent", "most_viewed", "most_commented"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSortChange(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        sortBy === s ? "bg-[#6C78DF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s === "recent" ? "Recent" : s === "most_viewed" ? "Most Viewed" : "Most Commented"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {data.posts.map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <ReviewsSection userId={String(data.user_id)} />
        </main>

        <RightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const img = Array.isArray(post.post_media) ? post.post_media[0] : undefined;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="post" className="w-full h-64 sm:h-80 object-cover" />
      )}
      <div className="p-4">
        {post.post_main_description && (
          <p className="text-sm font-semibold text-gray-900 mb-1">{post.post_main_description}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{post.post_des}</p>
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
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="rounded-[28px] bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF] p-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-28 h-28 rounded-2xl bg-white/15" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48 bg-white/15" />
              <Skeleton className="h-4 w-32 bg-white/15" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
