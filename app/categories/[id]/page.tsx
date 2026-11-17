"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Phone, MapPin, CheckCircle2, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CategoryIndexSidebar from "@/components/categories/CategoryIndexSidebar";
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
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* Banner */}
      <div className="relative rounded-[28px] overflow-hidden mb-6 shadow-2xl shadow-[#6C78DF]/20">
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

        <div className="relative p-6 sm:p-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-5 transition"
          >
            <ArrowLeft size={16} /> Back to Categories
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm">
              <LayoutGrid size={14} className="text-[#6C78DF]" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              Category
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {loading ? <Skeleton className="h-9 w-56 bg-white/15 inline-block" /> : catName}
          </h1>
          {!loading && (
            <p className="text-sm sm:text-base text-white/70">
              {users.length} listing{users.length !== 1 ? "s" : ""} in this category
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <CategoryIndexSidebar activeId={id} />

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No listings found in this category yet.</p>
              <Link href="/register" className="text-[#6C78DF] text-sm mt-2 block hover:underline">
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
        </main>
      </div>
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
        <div className="h-20 bg-gradient-to-r from-[#30337A] to-[#6C78DF] relative">
          {isPaid && (
            <span className="absolute top-2 right-2 text-[10px] font-bold bg-white text-[#30337A] px-2 py-0.5 rounded-full">
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
              <div className="w-full h-full flex items-center justify-center text-2xl bg-[#6C78DF]/10">
                👤
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-[#6C78DF] transition leading-tight">
              {user.name}
            </h3>
            {(user.cat_name) && (
              <CheckCircle2 size={14} className="text-[#6C78DF] flex-shrink-0" />
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
                user.is_service ? "bg-[#6C78DF]/10 text-[#30337A]" : "bg-orange-50 text-orange-600"
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
