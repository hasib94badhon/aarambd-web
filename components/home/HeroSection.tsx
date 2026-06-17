"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Phone, CheckCircle2, ArrowRight, Shield, Zap } from "lucide-react";

const POPULAR = ["Plumber", "Electrician", "Restaurant", "Doctor", "Lawyer", "Contractor", "Tailor", "Tutor"];

const SAMPLE_CARDS = [
  { name: "Rahman Electronics", cat: "Electronics", rating: 4.8, location: "Dhaka",     calls: 142, emoji: "📱" },
  { name: "City Plumbing Co.",  cat: "Plumbing",    rating: 4.6, location: "Chittagong", calls: 87,  emoji: "🔧" },
  { name: "Green Cuisine",      cat: "Restaurant",  rating: 4.9, location: "Sylhet",     calls: 203, emoji: "🍽️" },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

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
              Bangladesh&apos;s #1 Local Discovery Platform
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
              className="flex gap-2 max-w-xl animate-fade-in-up animation-delay-200 animation-fill-both"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search businesses, services, categories…"
                  className="w-full pl-11 pr-4 py-3.5 text-slate-900 bg-white border-0 rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="py-3.5 px-6 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-blue-500/30 flex items-center gap-1.5 whitespace-nowrap text-sm"
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

          {/* Right — floating cards */}
          <div className="hidden lg:flex flex-col gap-3 animate-fade-in animation-delay-200 animation-fill-both">
            {SAMPLE_CARDS.map((card, i) => (
              <div
                key={card.name}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all group cursor-default"
                style={{ transform: `translateX(${i % 2 === 1 ? "2rem" : "0"})` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {card.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm truncate">{card.name}</p>
                    <CheckCircle2 size={12} className="text-cyan-300 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">{card.cat} · {card.location}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-0.5 text-xs text-yellow-300 font-semibold">
                      <Star size={10} fill="currentColor" /> {card.rating}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-blue-200">
                      <Phone size={10} /> {card.calls} calls
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-2 py-1">
                  Open
                </span>
              </div>
            ))}

            {/* Trust badge */}
            <div className="mt-1 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-4 hover:bg-white/15 transition-all">
              <div className="flex -space-x-2.5">
                {["🧑", "👩", "👨", "🧕"].map((a, i) => (
                  <span
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white/40 flex items-center justify-center text-base"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">50,000+ active users</p>
                <p className="text-xs text-blue-200 mt-0.5">across all 64 districts</p>
              </div>
              <div className="text-right">
                <div className="flex justify-end">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11} className="text-yellow-300" fill="currentColor" />
                  ))}
                </div>
                <p className="text-[10px] text-blue-200 mt-0.5">4.8 / 5 rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
