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
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { publicApi, api } from "@/lib/api";
import ReviewsSection from "@/components/profile/ReviewsSection";
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
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Go back home
        </Link>
      </div>
    );
  }

  const isVerified = profile.nid || profile.tin;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Cover — taller, richer gradient */}
        <div className="h-44 sm:h-64 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar — bigger, circular */}
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-xl flex-shrink-0">
              {profile.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-green-50">
                  👤
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 pt-2 sm:pt-10">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {profile.name}
                </h1>
                {isVerified && (
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
                {profile.subscription_type && profile.subscription_type !== "" && (
                  <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                    ⭐ {profile.subscription_type}
                  </Badge>
                )}
              </div>
              {profile.cat_name && (
                <Badge variant="secondary" className="mt-1">
                  {profile.cat_name}
                </Badge>
              )}
              {profile.location && (
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-2">
                  <MapPin size={13} /> {profile.location}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {profile.call_status === 1 && (
                <a
                  href={`tel:${profile.phone}`}
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

          {/* Description */}
          {profile.description && (
            <p className="mt-5 text-sm text-gray-600 leading-relaxed max-w-2xl">
              {profile.description}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{profile.user_viewed}</span> Views
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Phone size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{profile.user_called}</span> Calls
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Share2 size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{profile.user_shared}</span> Shares
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MessageCircle size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-700">{profile.user_total_post}</span> Posts
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {profile.posts?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Posts & Updates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {profile.posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewsSection userId={user_id} />
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
        <img src={img} alt="post" className="w-full h-64 sm:h-72 object-cover" />
      )}
      <div className="p-4">
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Skeleton className="h-5 w-20 mb-6" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="px-6 pb-6 -mt-16 space-y-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
      </div>
    </div>
  );
}
