"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { publicApi } from "@/lib/api";

interface ListingUser {
  user_id: number;
  name: string;
  photo?: string;
  location?: string;
  description?: string;
  call_status: number;
  user_viewed: number;
  user_called: number;
  cat_name?: string;
  cat_logo?: string;
  subscription_type?: string;
  service_id?: number | null;
  shop_id?: number | null;
  is_service?: boolean | null;
}

function resolveHref(u: ListingUser): string {
  if (u.is_service && u.service_id) return `/service/${u.service_id}`;
  if (u.is_service === false && u.shop_id) return `/shop/${u.shop_id}`;
  return `/profile/${u.user_id}`;
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [catName, setCatName] = useState("");
  const [users, setUsers] = useState<ListingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_users_by_category", { params: { cat_id: id, page: 1, page_size: 30 } })
      .then((r) => {
        setCatName(r.data.cat_name ?? "Category");
        setUsers(r.data.users ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Categories
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {loading ? <Skeleton className="h-9 w-56 inline-block" /> : catName}
        </h1>
        {!loading && (
          <p className="text-gray-500 mt-1 text-sm">
            {users.length} listing{users.length !== 1 ? "s" : ""} in this category
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No listings found in this category yet.</p>
          <Link href="/register" className="text-blue-600 text-sm mt-2 block hover:underline">
            Be the first to list your business
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => (
            <UserCard key={u.user_id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({ user }: { user: ListingUser }) {
  const href = resolveHref(user);
  const isPaid = user.subscription_type === "paid";

  return (
    <Link href={href}>
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        {/* Cover */}
        <div className="h-20 bg-gradient-to-r from-green-500 to-emerald-400 relative">
          {isPaid && (
            <span className="absolute top-2 right-2 text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
              ⭐ Pro
            </span>
          )}
        </div>

        <div className="px-5 pb-5 -mt-8">
          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gray-100 mb-3 shadow-sm">
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl bg-green-50">
                👤
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition leading-tight">
              {user.name}
            </h3>
            {(user.cat_name) && (
              <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />
            )}
          </div>

          {user.cat_name && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {user.cat_name}
            </Badge>
          )}

          {user.location && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <MapPin size={11} /> {user.location}
            </p>
          )}

          {user.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {user.description}
            </p>
          )}

          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {user.user_viewed ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} /> {user.user_called ?? 0}
            </span>
            {user.is_service != null && (
              <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${
                user.is_service ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
              }`}>
                {user.is_service ? "Service" : "Shop"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
