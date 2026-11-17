"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Eye,
  Phone,
  Share2,
  FileText,
  BadgeCheck,
  Crown,
  ExternalLink,
  Check,
  QrCode,
} from "lucide-react";

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
  const isPremium = !!user.subscription_type;
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/profile/${user.user_id}` : "";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, silently ignore */
    }
  };

  return (
    <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-[#6C78DF]/20">
      {/* Card background: AaramBD brand gradient — deep indigo to the real logo periwinkle */}
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

      {/* Top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative p-6 sm:p-8">
        {/* Card brand row */}
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
              <Crown size={12} /> {user.subscription_type}
            </span>
          )}
        </div>

        {/* Main row: avatar + identity + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl p-[2px] bg-white shadow-lg">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-[#30337A]">
                {user.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-white/60">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
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

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {user.cat_name && (
                <span className="text-sm font-medium text-white/80 italic">{user.cat_name}</span>
              )}
              {user.location && (
                <span className="flex items-center gap-1 text-xs text-white/55">
                  <MapPin size={12} /> {user.location}
                </span>
              )}
            </div>
            {user.phone && (
              <span className="flex items-center gap-1.5 text-xs text-white/70 mt-2">
                <Phone size={12} className="text-white" /> {user.phone}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <Link
              href={`/profile/${user.user_id}`}
              target="_blank"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl px-4 py-2.5 transition whitespace-nowrap"
            >
              <ExternalLink size={13} /> View Public Profile
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white hover:bg-white/90 text-[#30337A] rounded-xl px-4 py-2.5 transition whitespace-nowrap"
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              {copied ? "Link Copied" : "Share Card"}
            </button>
          </div>
        </div>

        {/* Description */}
        {user.description && (
          <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-2xl border-l-2 border-white/25 pl-3">
            {user.description}
          </p>
        )}

        {/* Divider */}
        <div className="mt-6 border-t border-white/15" />

        {/* Stats strip */}
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          {[
            { icon: Eye, label: "Views", value: user.user_viewed },
            { icon: Phone, label: "Calls", value: user.user_called },
            { icon: Share2, label: "Shares", value: user.user_shared },
            { icon: FileText, label: "Posts", value: user.user_total_post },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={14} className="text-white/70" />
              <span className="text-base font-bold text-white tabular-nums">{s.value ?? 0}</span>
              <span className="text-xs text-white/55">{s.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/45 tracking-widest uppercase">
            <QrCode size={12} />
            ID {user.user_id.padStart(6, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
