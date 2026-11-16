"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Phone, CheckCircle2, ArrowRight, Shield, Zap } from "lucide-react";
import { publicApi } from "@/lib/api";

const POPULAR = ["Plumber", "Electrician", "Restaurant", "Doctor", "Lawyer", "Contractor", "Tailor", "Tutor"];

interface TopUser {
  user_id: number;
  name: string;
  cat_name?: string;
  location?: string;
  user_called?: number;
  type?: "paid" | string | null;
  service_id?: number;
  shop_id?: number;
  is_service?: boolean | null;
}

interface PlatformStats {
  total_businesses: number;
  total_posts: number;
}

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    publicApi
      .get("/get_most_viewed_users")
      .then((r: { data: { user_viewed_users?: TopUser[] } }) => {
        const consumerFacing = (r.data.user_viewed_users ?? []).filter(
          (u) => !u.cat_name?.toLowerCase().includes("data collector")
        );
        setTopUsers(consumerFacing.slice(0, 3));
      })
      .catch(() => {});

    publicApi
      .get("/get_platform_stats")
      .then((r: { data: PlatformStats }) => setStats(r.data))
      .catch(() => {});
  }, []);

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-7 animate-fade-in animation-fill-both">
              <MapPin size={12} className="text-cyan-300" />
              Bangladesh&apos;s Local Discovery Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5 animate-fade-in-up animation-fill-both">
              Find the Right
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                Business or Service
              </span>
              <br />
              Near You
            </h1>

            <p className="text-lg text-blue-200 mb-8 max-w-xl leading-relaxed animate-fade-in-up animation-delay-100 animation-fill-both">
              Connect with trusted local businesses, skilled professionals, and
              service providers across Bangladesh — all in one place.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-xl animate-fade-in-up animation-delay-200 animation-fill-both"
            >
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search businesses, services, categories…"
                  className="w-full min-w-0 pl-11 pr-4 py-3.5 text-slate-900 bg-white border-0 rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="py-3.5 px-6 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-blue-500/30 flex items-center justify-center gap-1.5 whitespace-nowrap text-sm w-full sm:w-auto"
              >
                Search <ArrowRight size={15} />
              </button>
            </form>

            {/* Popular tags */}
            <div className="mt-5 flex flex-wrap items-center gap-2 animate-fade-in-up animation-delay-300 animation-fill-both">
              <span className="text-xs text-blue-300 font-medium">Popular:</span>
              {POPULAR.map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 rounded-full px-3 py-1.5 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-blue-200 animate-fade-in-up animation-delay-400 animation-fill-both">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-cyan-300" /> Verified Businesses
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-cyan-300" /> Instant Connect
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-cyan-300" /> 64 Districts
              </span>
            </div>
          </div>

          {/* Right — real top businesses */}
          <div className="hidden lg:flex flex-col gap-3 animate-fade-in animation-delay-200 animation-fill-both">
            {topUsers.map((u, i) => {
              const href = u.is_service
                ? `/service/${u.service_id}`
                : u.is_service === false
                ? `/shop/${u.shop_id}`
                : `/profile/${u.user_id}`;
              return (
                <button
                  key={u.user_id}
                  onClick={() => router.push(href)}
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all group text-left"
                  style={{ transform: `translateX(${i % 2 === 1 ? "2rem" : "0"})` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                    {u.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm truncate">{u.name}</p>
                      {u.type === "paid" && (
                        <CheckCircle2 size={12} className="text-cyan-300 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5 truncate">
                      {u.cat_name ?? "Business"}
                      {u.location ? ` · ${u.location}` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-0.5 text-xs text-blue-200">
                        <Phone size={10} /> {u.user_called ?? 0} {(u.user_called ?? 0) === 1 ? "call" : "calls"}
                      </span>
                    </div>
                  </div>
                  {u.type === "paid" && (
                    <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-2 py-1 flex-shrink-0">
                      Verified
                    </span>
                  )}
                </button>
              );
            })}

            {/* Trust badge — real platform totals */}
            {stats && (
              <div className="mt-1 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-4 hover:bg-white/15 transition-all">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {stats.total_businesses.toLocaleString("en-US")}+ registered businesses
                  </p>
                  <p className="text-xs text-blue-200 mt-0.5">across Bangladesh</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {stats.total_posts.toLocaleString("en-US")}+
                  </p>
                  <p className="text-[10px] text-blue-200 mt-0.5">updates shared</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
