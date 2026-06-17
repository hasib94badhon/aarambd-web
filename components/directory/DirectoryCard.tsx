import Link from "next/link";
import { MapPin, Eye, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DirectoryUser {
  user_id: number;
  name: string;
  phone: string;
  location?: string;
  description?: string;
  photo?: string;
  cat_name?: string;
  cat_logo?: string;
  service_id?: number;
  shop_id?: number;
  is_service?: boolean | null;
  user_viewed?: number;
  user_called?: number;
  subscription_type?: string;
}

function resolveHref(user: DirectoryUser): string {
  if (user.is_service && user.service_id) return `/service/${user.service_id}`;
  if (user.is_service === false && user.shop_id) return `/shop/${user.shop_id}`;
  return `/profile/${user.user_id}`;
}

export default function DirectoryCard({ user }: { user: DirectoryUser }) {
  const href = resolveHref(user);
  const isPaid = user.subscription_type === "paid";

  return (
    <Link href={href}>
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${isPaid ? "bg-gradient-to-r from-yellow-400 to-amber-300" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`} />

        <div className="p-4 flex gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center border border-gray-100">
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition truncate leading-tight">
                  {user.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {user.cat_name && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {user.cat_name}
                    </Badge>
                  )}
                  {isPaid && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold leading-none">
                      ⭐ Pro
                    </span>
                  )}
                  {user.is_service != null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium leading-none ${
                      user.is_service ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {user.is_service ? "Service" : "Shop"}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-blue-500 transition text-sm flex-shrink-0 mt-0.5">›</span>
            </div>

            {user.location && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5 truncate">
                <MapPin size={10} /> {user.location}
              </p>
            )}

            {user.description && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {user.description}
              </p>
            )}

            {(user.user_viewed != null || user.user_called != null) && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
                {user.user_viewed != null && (
                  <span className="flex items-center gap-1">
                    <Eye size={10} /> {user.user_viewed}
                  </span>
                )}
                {user.user_called != null && (
                  <span className="flex items-center gap-1">
                    <Phone size={10} /> {user.user_called}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
