"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, User, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import RightSidebar from "@/components/home/RightSidebar";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface FavoriteProfile {
  user_id: number;
  name: string;
  cat_name: string;
  photo: string;
  service_id: number;
  shop_id: number;
  is_service: boolean;
}

export default function SavedPage() {
  const { user, isLoggedIn, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [profiles, setProfiles] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }
    api
      .get("/get_favorite_user_profiles", { params: { user_id: user.user_id } })
      .then((r) => setProfiles(r.data.favorite_profiles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hydrated, isLoggedIn, user]);

  const handleRemove = async (favUserId: number) => {
    if (!user) return;
    setRemoving(favUserId);
    try {
      await api.post("/remove_from_favorite_users", {
        user_id: user.user_id,
        fav_users: favUserId,
      });
      setProfiles((prev) => prev.filter((p) => p.user_id !== favUserId));
    } catch {
      /* silent */
    } finally {
      setRemoving(null);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#6C78DF]/10 flex items-center justify-center">
          <Bookmark size={24} className="text-[#6C78DF]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Saved List</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Login to see businesses you&apos;ve saved for quick access.
        </p>
        <Link href="/login">
          <Button className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white">Login to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex gap-4 items-start">
      <main className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#6C78DF]/10 flex items-center justify-center">
          <Bookmark size={20} className="text-[#6C78DF]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Saved</h1>
          <p className="text-sm text-gray-400">Businesses you&apos;ve bookmarked</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">You haven&apos;t saved any businesses yet.</p>
          <Link href="/businesses" className="text-[#6C78DF] hover:underline text-sm mt-2 inline-block">
            Browse Businesses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {profiles.map((p) => (
            <SavedCard key={p.user_id} profile={p} removing={removing === p.user_id} onRemove={handleRemove} />
          ))}
        </div>
      )}
      </main>

      <RightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}

function resolveHref(p: FavoriteProfile): string {
  if (p.is_service && p.service_id) return `/service/${p.service_id}`;
  if (p.is_service === false && p.shop_id) return `/shop/${p.shop_id}`;
  return `/profile/${p.user_id}`;
}

function SavedCard({
  profile,
  removing,
  onRemove,
}: {
  profile: FavoriteProfile;
  removing: boolean;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <Link href={resolveHref(profile)} className="block p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
            {profile.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
            {profile.cat_name && (
              <Badge variant="secondary" className="text-xs mt-0.5">
                {profile.cat_name}
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 text-xs"
          disabled={removing}
          onClick={() => onRemove(profile.user_id)}
        >
          <Trash2 size={13} /> {removing ? "Removing…" : "Remove from Saved"}
        </Button>
      </div>
    </div>
  );
}
