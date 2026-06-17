"use client";

import Link from "next/link";
import { MapPin, Eye, Phone, Share2, FileText, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardUser {
  user_id: string;
  name: string;
  phone: string;
  description: string;
  cat_name: string;
  photo: string;
  location: string;
  user_viewed: number;
  user_called: number;
  user_shared: number;
  user_total_post: number;
  nid: string;
  tin: string;
  subscription_type: string;
}

export default function ProfileHeader({ user }: { user: DashboardUser }) {
  const isVerified = !!(user.nid || user.tin);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cover */}
      <div className="h-44 sm:h-64 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="px-6 pb-6 -mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-xl flex-shrink-0">
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-green-50">
                👤
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 pt-2 sm:pt-10">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              {isVerified && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
              {user.subscription_type && (
                <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                  ⭐ {user.subscription_type}
                </Badge>
              )}
            </div>
            {user.cat_name && (
              <Badge variant="secondary" className="mt-1">{user.cat_name}</Badge>
            )}
            {user.location && (
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-1.5">
                <MapPin size={13} /> {user.location}
              </p>
            )}
          </div>

          {/* Public profile link */}
          <Link
            href={`/profile/${user.user_id}`}
            target="_blank"
            className="flex-shrink-0 px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
          >
            View public profile →
          </Link>
        </div>

        {/* Description */}
        {user.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
            {user.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          {[
            { icon: <Eye size={14} />, label: "Views", value: user.user_viewed },
            { icon: <Phone size={14} />, label: "Calls", value: user.user_called },
            { icon: <Share2 size={14} />, label: "Shares", value: user.user_shared },
            { icon: <FileText size={14} />, label: "Posts", value: user.user_total_post },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400">{s.icon}</span>
              <span className="font-bold text-gray-800">{s.value ?? 0}</span>
              <span>{s.label}</span>
            </div>
          ))}
          {user.subscription_type && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Star size={14} className="text-yellow-400" />
              <span className="font-bold text-gray-800">{user.subscription_type}</span>
              <span>Plan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
