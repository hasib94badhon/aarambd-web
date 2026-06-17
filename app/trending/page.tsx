"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Eye, Phone, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface TrendingUser {
  user_id: number;
  name: string;
  cat_name: string;
  photo: string;
  user_viewed: number;
  user_called: number;
  location?: string;
  description?: string;
  type?: string;
  service_id?: number;
  shop_id?: number;
  is_service?: boolean | null;
}

function resolveHref(u: TrendingUser): string {
  if (u.is_service && u.service_id) return `/service/${u.service_id}`;
  if (u.is_service === false && u.shop_id) return `/shop/${u.shop_id}`;
  return `/profile/${u.user_id}`;
}

export default function TrendingPage() {
  const [users, setUsers] = useState<TrendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_most_viewed_users")
      .then((r) => setUsers(r.data.user_viewed_users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <TrendingUp size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Trending</h1>
          <p className="text-sm text-gray-400">Most viewed &amp; contacted businesses on AaramBD</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No trending users found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {users.map((user, idx) => (
            <TrendingCard key={user.user_id} user={user} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingCard({ user, rank }: { user: TrendingUser; rank: number }) {
  const isPaid = user.type === "paid";

  return (
    <Link href={resolveHref(user)}>
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden">
        <div className="relative h-24 bg-gradient-to-br from-green-50 to-emerald-100">
          <span className="absolute top-2 left-2 text-xs font-bold text-white bg-gray-900/60 rounded-full px-2 py-0.5">
            #{rank}
          </span>
          {isPaid && (
            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold text-yellow-800 bg-yellow-300 rounded-full px-2 py-0.5">
              <Star size={10} fill="currentColor" /> Pro
            </span>
          )}
        </div>

        <div className="px-4 pb-4 -mt-8">
          <div className="w-16 h-16 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow mb-2">
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-gray-300" />
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition">
            {user.name}
          </h3>
          {user.cat_name && (
            <Badge variant="secondary" className="text-xs mt-0.5">
              {user.cat_name}
            </Badge>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {user.user_viewed ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} /> {user.user_called ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
