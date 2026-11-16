"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Store,
  Wrench,
  TrendingUp,
  Bookmark,
  User as UserIcon,
  Bell,
  LogIn,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface DesCategory {
  des_cat_id: number;
  des_cat_name: string;
}

interface DesSubCategory {
  des_sub_cat_id: number;
  name: string;
  emoji: string;
}

interface AuthUser {
  user_id: number;
  name: string;
}

export default function LeftSidebar({
  activeCat,
  activeSubCat,
  onSelectCat,
  onSelectSubCat,
  isLoggedIn,
  user,
}: {
  activeCat: number | null;
  activeSubCat: number | null;
  onSelectCat: (id: number) => void;
  onSelectSubCat: (id: number | null) => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
}) {
  const [categories, setCategories] = useState<DesCategory[]>([]);
  const [subCategories, setSubCategories] = useState<DesSubCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_description_categories")
      .then((r: { data: { categories?: DesCategory[] } }) => {
        const cats = r.data.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) onSelectCat(cats[0].des_cat_id);
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeCat) {
      setSubCategories([]);
      return;
    }
    publicApi
      .get("/get_des_sub_categories", { params: { des_cat_id: activeCat } })
      .then((r: { data: { sub_categories?: DesSubCategory[] } }) =>
        setSubCategories(r.data.sub_categories ?? [])
      )
      .catch(() => {});
  }, [activeCat]);

  const shortcuts = [
    { href: "/", label: "Home", icon: Home },
    { href: "/businesses", label: "Businesses", icon: Store },
    { href: "/services", label: "Services", icon: Wrench },
    { href: "/trending", label: "Trending", icon: TrendingUp },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-20 self-start w-[260px] shrink-0 max-h-[calc(100vh-5.5rem)] overflow-y-auto pb-6">
      {/* Profile / auth */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
        {isLoggedIn && user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-slate-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-semibold text-slate-800 truncate">{user.name}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg hover:bg-slate-50 transition text-blue-600"
          >
            <LogIn size={18} />
            <span className="text-sm font-semibold">Sign in</span>
          </Link>
        )}
      </div>

      {/* Shortcuts */}
      <nav className="bg-white rounded-xl border border-slate-100 shadow-sm p-2">
        {shortcuts.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
          >
            <l.icon size={18} className="text-slate-500" />
            {l.label}
          </Link>
        ))}
        {isLoggedIn && (
          <>
            <Link
              href="/saved"
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <Bookmark size={18} className="text-slate-500" />
              Saved
            </Link>
            <Link
              href="/notifications"
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <Bell size={18} className="text-slate-500" />
              Notifications
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <UserIcon size={18} className="text-slate-500" />
              Dashboard
            </Link>
          </>
        )}
      </nav>

      {/* Thoughts categories */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2">
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          <Lightbulb size={14} />
          Thoughts &amp; Needs
        </div>
        {catsLoading ? (
          <div className="space-y-1.5 px-2.5 pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 rounded-lg" />
            ))}
          </div>
        ) : (
          <div>
            {categories.map((cat) => (
              <div key={cat.des_cat_id}>
                <button
                  onClick={() => {
                    onSelectCat(cat.des_cat_id);
                    onSelectSubCat(null);
                  }}
                  className={`w-full text-left flex items-center px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCat === cat.des_cat_id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cat.des_cat_name}
                </button>
                {activeCat === cat.des_cat_id && subCategories.length > 0 && (
                  <div className="pl-4 pb-1 flex flex-wrap gap-1.5 pr-1">
                    <button
                      onClick={() => onSelectSubCat(null)}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${
                        activeSubCat === null
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      All
                    </button>
                    {subCategories.map((sc) => (
                      <button
                        key={sc.des_sub_cat_id}
                        onClick={() => onSelectSubCat(sc.des_sub_cat_id)}
                        className={`text-xs px-2 py-1 rounded-full border transition-all ${
                          activeSubCat === sc.des_sub_cat_id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {sc.emoji ? `${sc.emoji} ` : ""}
                        {sc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
