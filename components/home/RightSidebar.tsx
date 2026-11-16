"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, Megaphone, Phone, PlayCircle, Globe, Smartphone, Apple } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PostDetailSheet from "@/components/feed/PostDetailSheet";
import { publicApi } from "@/lib/api";
import { Category, FeedPost } from "@/lib/types";

interface TopUser {
  user_id: number;
  name: string;
  cat_name?: string;
  user_called?: number;
  type?: string | null;
  service_id?: number;
  shop_id?: number;
  is_service?: boolean | null;
}

interface SocialItem {
  id: number;
  name: string;
  cat: string;
  photo: string;
  link: string;
  visit_count: number;
  kind: "fb" | "yt";
}

export default function RightSidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<FeedPost[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [social, setSocial] = useState<SocialItem[]>([]);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [androidUrl, setAndroidUrl] = useState<string | null>(null);
  const [iosUrl, setIosUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    publicApi
      .get("/get_app_version", { params: { platform: "android" } })
      .then((r: { data: { store_url?: string } }) => setAndroidUrl(r.data.store_url || null))
      .catch(() => {});

    publicApi
      .get("/get_app_version", { params: { platform: "ios" } })
      .then((r: { data: { store_url?: string } }) => {
        const url = r.data.store_url || "";
        // Not configured yet on the backend -- don't link to a dead placeholder.
        setIosUrl(url && !url.includes("REPLACE") ? url : null);
      })
      .catch(() => {});

    publicApi
      .get("/get_categories_name")
      .then((r: { data: { categories?: Category[] } }) => setCategories((r.data.categories ?? []).slice(0, 8)))
      .catch(() => {});

    publicApi
      .get("/get_today_post", { params: { sort_by: "most_viewed", page: 1, page_size: 4 } })
      .then((r: { data: { most_update_post?: FeedPost[] } }) => setTrending(r.data.most_update_post ?? []))
      .catch(() => {});

    publicApi
      .get("/get_most_viewed_users")
      .then((r: { data: { user_viewed_users?: TopUser[] } }) => {
        const consumerFacing = (r.data.user_viewed_users ?? []).filter(
          (u) => !u.cat_name?.toLowerCase().includes("data collector")
        );
        setTopUsers(consumerFacing.slice(0, 4));
      })
      .catch(() => {});

    Promise.all([
      publicApi.get("/get_fb_page").catch(() => ({ data: { fb_page: [] } })),
      publicApi.get("/get_yt_channels").catch(() => ({ data: { yt_channels: [] } })),
    ]).then(([fb, yt]) => {
      const fbItems: SocialItem[] = (fb.data.fb_page ?? []).map((p: { page_id: number; name: string; cat: string; photo: string; link: string; visit_count: number }) => ({
        id: p.page_id, name: p.name, cat: p.cat, photo: p.photo, link: p.link, visit_count: p.visit_count ?? 0, kind: "fb" as const,
      }));
      const ytItems: SocialItem[] = (yt.data.yt_channels ?? []).map((c: { channel_id: number; name: string; cat: string; photo: string; link: string; visit_count: number }) => ({
        id: c.channel_id, name: c.name, cat: c.cat, photo: c.photo, link: c.link, visit_count: c.visit_count ?? 0, kind: "yt" as const,
      }));
      setSocial([...fbItems, ...ytItems].sort((a, b) => b.visit_count - a.visit_count).slice(0, 4));
    });
  }, []);

  const openPost = (post: FeedPost) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setActivePost(post);
  };

  const trackSocialVisit = (item: SocialItem) => {
    publicApi.post(item.kind === "fb" ? "/fb_page_visit" : "/yt_channel_visit", {
      [item.kind === "fb" ? "page_id" : "channel_id"]: item.id,
    }).catch(() => {});
  };

  return (
    <aside className="hidden xl:flex flex-col gap-4 sticky top-20 self-start w-[300px] shrink-0 max-h-[calc(100vh-5.5rem)] overflow-y-auto pb-6">
      {/* Get the app */}
      <div className="bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF] rounded-xl p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70 mb-3">Get the App</p>
          <div className="flex flex-col gap-2">
            {androidUrl ? (
              <a
                href={androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-2 transition"
              >
                <Smartphone size={18} className="text-white flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/60 leading-none">GET IT ON</p>
                  <p className="text-xs font-semibold text-white leading-tight">Google Play</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 opacity-60">
                <Smartphone size={18} className="text-white flex-shrink-0" />
                <p className="text-xs font-medium text-white/70">Android — coming soon</p>
              </div>
            )}

            {iosUrl ? (
              <a
                href={iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-2 transition"
              >
                <Apple size={18} className="text-white flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-white/60 leading-none">DOWNLOAD ON THE</p>
                  <p className="text-xs font-semibold text-white leading-tight">App Store</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 opacity-60">
                <Apple size={18} className="text-white flex-shrink-0" />
                <p className="text-xs font-medium text-white/70">iOS — coming soon</p>
              </div>
            )}
          </div>
        </div>

      {/* Browse categories */}
      <Widget title="Browse Categories" viewAllHref="/categories">
        {categories.length === 0 ? (
          <SkeletonRows />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <Link
                key={c.cat_id}
                href={`/categories/${c.cat_id}`}
                className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-[#6C78DF]/10 hover:text-[#30337A] rounded-lg px-2.5 py-2 transition truncate"
              >
                {c.cat_name}
              </Link>
            ))}
          </div>
        )}
      </Widget>

      {/* Trending posts */}
      <Widget title="Trending Now" icon={Megaphone} viewAllHref="/trending">
        {trending.length === 0 ? (
          <SkeletonRows />
        ) : (
          <div className="space-y-3">
            {trending.map((p) => (
              <button
                key={p.post_id}
                onClick={() => openPost(p)}
                className="w-full flex items-center gap-2.5 text-left hover:bg-slate-50 rounded-lg p-1.5 -m-1.5 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {p.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.name ?? "Business"}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Eye size={10} /> {p.view ?? 0} views
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Widget>

      {/* Top businesses */}
      <Widget title="Top Businesses" viewAllHref="/businesses">
        {topUsers.length === 0 ? (
          <SkeletonRows />
        ) : (
          <div className="space-y-1">
            {topUsers.map((u) => {
              const href = u.is_service ? `/service/${u.service_id}` : u.is_service === false ? `/shop/${u.shop_id}` : `/profile/${u.user_id}`;
              return (
                <Link
                  key={u.user_id}
                  href={href}
                  className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-1.5 -m-1.5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8990E8] to-[#30337A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.cat_name}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                    <Phone size={10} /> {u.user_called ?? 0}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Widget>

      {/* Social */}
      {social.length > 0 && (
        <Widget title="Follow on Social" viewAllHref="/social">
          <div className="space-y-1">
            {social.map((s) => (
              <a
                key={`${s.kind}-${s.id}`}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialVisit(s)}
                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-1.5 -m-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {s.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo} alt="" className="w-full h-full object-cover" />
                  ) : s.kind === "fb" ? (
                    <Globe size={14} className="text-[#6C78DF]" />
                  ) : (
                    <PlayCircle size={14} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{s.cat}</p>
                </div>
              </a>
            ))}
          </div>
        </Widget>
      )}

      {/* Business CTA */}
      <Link
        href="/for-business"
        className="block bg-gradient-to-br from-[#30337A] to-[#6C78DF] rounded-xl p-4 text-white hover:shadow-lg transition-all"
      >
        <p className="text-sm font-bold mb-1">Own a business?</p>
        <p className="text-xs text-white/80 mb-3">Get listed and reach more customers across Bangladesh.</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">
          Get Started <ArrowRight size={12} />
        </span>
      </Link>

      <PostDetailSheet post={activePost} open={activePost !== null} onClose={() => setActivePost(null)} />
    </aside>
  );
}

function Widget({
  title,
  icon: Icon,
  viewAllHref,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          {Icon && <Icon size={13} />}
          {title}
        </span>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[11px] font-medium text-[#6C78DF] hover:text-[#30337A]">
            View all
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-9 rounded-lg" />
      ))}
    </div>
  );
}
