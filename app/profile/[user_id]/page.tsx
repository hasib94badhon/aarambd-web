"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Phone,
  Share2,
  MapPin,
  MessageCircle,
  Clock,
  BadgeCheck,
  Crown,
  Bookmark,
  BookmarkCheck,
  Check,
  QrCode,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { publicApi, api } from "@/lib/api";
import ReviewsSection from "@/components/profile/ReviewsSection";
import RightSidebar from "@/components/home/RightSidebar";
import { useAuthStore } from "@/store/authStore";

interface ProfileData {
  user_id: string;
  name: string;
  phone: string;
  description: string;
  cat_id: number;
  cat_name: string;
  photo: string;
  location: string;
  user_viewed: number;
  user_called: number;
  user_shared: number;
  call_status: number;
  user_total_post: number;
  nid: string;
  tin: string;
  subscription_type: string;
  posts: {
    post_id: string;
    post_description: string;
    post_media: string[];
    post_time: string;
    post_viewed: number;
    post_comments: number;
  }[];
}

export default function ProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const { user: currentUser, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSelf = isLoggedIn && String(currentUser?.user_id) === user_id;

  useEffect(() => {
    publicApi
      .get("/get_profile_by_id", { params: { user_id } })
      .then((r) => setProfile(r.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));

    // Track profile view (fire-and-forget, no auth needed)
    publicApi.post("/update_views", { user_id: parseInt(user_id) }).catch(() => {});
  }, [user_id]);

  // Check if already saved
  useEffect(() => {
    if (!isLoggedIn || !currentUser || isSelf) return;
    api
      .get("/get_favorite_user_ids", { params: { user_id: currentUser.user_id } })
      .then((r) => {
        const ids: number[] = r.data.favorite_user_ids ?? [];
        setSaved(ids.includes(parseInt(user_id)));
      })
      .catch(() => {});
  }, [isLoggedIn, currentUser, user_id, isSelf]);

  const handleSaveToggle = async () => {
    if (!currentUser) return;
    setSavingToggle(true);
    try {
      if (saved) {
        await publicApi.post("/remove_from_favorite_users", {
          user_id: currentUser.user_id,
          fav_users: parseInt(user_id),
        });
        setSaved(false);
      } else {
        await api.post("/add_to_favorite_users", {
          user_id: currentUser.user_id,
          fav_users: parseInt(user_id),
        });
        setSaved(true);
      }
    } catch {
      /* silent */
    } finally {
      setSavingToggle(false);
    }
  };

  const handleCall = () => {
    // Track call stat (fire-and-forget)
    publicApi.post("/update_calls", { user_id: parseInt(user_id) }).catch(() => {});
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = profile?.name ?? "AaramBD Profile";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <ProfileSkeleton />;

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Not Found</h2>
        <p className="text-gray-500">This user may not exist or has been removed.</p>
        <Link href="/" className="text-[#6C78DF] hover:underline text-sm">
          Go back home
        </Link>
      </div>
    );
  }

  const isVerified = !!(profile.nid || profile.tin);
  const isPremium = !!profile.subscription_type;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex gap-4 items-start">
        <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6C78DF] mb-6 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

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
                    Member Card
                  </span>
                </div>
                {isPremium && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white bg-white/15 border border-white/25 rounded-full px-3 py-1 capitalize">
                    <Crown size={12} /> {profile.subscription_type}
                  </span>
                )}
              </div>

              {/* Main row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative flex-shrink-0 self-start">
                  <div className="w-28 h-28 rounded-2xl p-[2px] bg-white shadow-lg">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-[#30337A]">
                      {profile.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-white/60">
                          {profile.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#30337A] flex items-center justify-center">
                      <BadgeCheck size={14} className="text-[#6C78DF]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    {profile.cat_name && (
                      <span className="text-sm font-medium text-white/80 italic">{profile.cat_name}</span>
                    )}
                    {profile.location && (
                      <span className="flex items-center gap-1 text-xs text-white/55">
                        <MapPin size={12} /> {profile.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {profile.call_status === 1 && (
                    <a
                      href={`tel:${profile.phone}`}
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
              {profile.description && (
                <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-2xl border-l-2 border-white/25 pl-3">
                  {profile.description}
                </p>
              )}

              <div className="mt-6 border-t border-white/15" />

              {/* Stats */}
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                {[
                  { icon: Eye, label: "Views", value: profile.user_viewed },
                  { icon: Phone, label: "Calls", value: profile.user_called },
                  { icon: Share2, label: "Shares", value: profile.user_shared },
                  { icon: MessageCircle, label: "Posts", value: profile.user_total_post },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <s.icon size={14} className="text-white/70" />
                    <span className="text-base font-bold text-white tabular-nums">{s.value ?? 0}</span>
                    <span className="text-xs text-white/55">{s.label}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/45 tracking-widest uppercase">
                  <QrCode size={12} />
                  ID {profile.user_id.padStart(6, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {profile.posts?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Posts &amp; Updates</h2>
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <ReviewsSection userId={user_id} />
        </main>

        <RightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}

function PostCard({
  post,
}: {
  post: ProfileData["posts"][number];
}) {
  const img = post.post_media?.[0];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="post" className="w-full h-64 sm:h-80 object-cover" />
      )}
      <div className="p-4">
        <p className="text-sm text-gray-800 leading-relaxed">
          {post.post_description}
        </p>
        <Separator className="my-3" />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {post.post_time?.split(" ").slice(1, 4).join(" ")}
          </span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {post.post_viewed}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={11} /> {post.post_comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto w-full">
        <Skeleton className="h-5 w-20 mb-6" />
        <div className="rounded-[28px] bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF] p-8 mb-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-28 h-28 rounded-2xl bg-white/15" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48 bg-white/15" />
              <Skeleton className="h-4 w-32 bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
