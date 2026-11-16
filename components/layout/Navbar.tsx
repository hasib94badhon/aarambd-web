"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Menu, X, User, LogOut, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function Navbar() {
  const { isLoggedIn, user, logout, hydrate } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    api
      .get("/get_notifications", { params: { user_id: user.user_id, page: 1, page_size: 20 } })
      .then((r) => {
        const notifs: { is_read: boolean }[] = r.data.notifications ?? [];
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
  }, [isLoggedIn, user]);

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  const navLinks = [
    { href: "/categories", label: "Categories" },
    { href: "/businesses", label: "Businesses" },
    { href: "/services", label: "Services" },
    { href: "/social", label: "Social" },
    { href: "/trending", label: "Trending" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-slate-200/60"
          : "bg-white border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 mr-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-sm leading-none">A</span>
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Aaram<span className="text-blue-600">BD</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses, services…"
                className="pl-9 h-9 rounded-full border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-sm transition-colors"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
              >
                {l.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link href="/feed" className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                  Feed
                </Link>
                <Link href="/thoughts" className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                  Thoughts
                </Link>
              </>
            )}

            <Link
              href="/for-business"
              className="text-sm font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all ml-1"
            >
              For Business
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                <Link href="/notifications" className="relative p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <User size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <Link href="/login">
                  <button className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-all">
                    Sign in
                  </button>
                </Link>
                <Link href="/register">
                  <button className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
                    Join Free
                  </button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile right side */}
          <div className="flex items-center gap-1 ml-auto md:hidden">
            {isLoggedIn && (
              <Link href="/notifications" className="relative p-2 text-slate-500">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-1 shadow-xl animate-fade-in-up">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses, services…"
              className="pl-9 rounded-full bg-slate-50"
            />
          </form>

          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/for-business"
            onClick={() => setMenuOpen(false)}
            className="flex items-center py-2.5 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
          >
            For Business
          </Link>
          <Link
            href="/partner"
            onClick={() => setMenuOpen(false)}
            className="flex items-center py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            Become a Partner
          </Link>

          {isLoggedIn ? (
            <div className="pt-2 mt-1 border-t border-slate-100 space-y-1">
              {[
                { href: "/feed",          label: "Feed" },
                { href: "/thoughts",      label: "Thoughts & Needs" },
                { href: "/saved",         label: "Saved" },
                { href: "/dashboard",     label: "Dashboard" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 py-2.5 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-3 mt-1 border-t border-slate-100">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="w-full py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1">
                <button className="w-full py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
                  Join Free
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
