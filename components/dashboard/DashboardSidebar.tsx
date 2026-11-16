"use client";

import {
  Images,
  FileText,
  PlusCircle,
  MessageCircle,
  UserCog,
  Settings2,
  BarChart2,
  BadgeCheck,
  Crown,
} from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isVerified: boolean;
  subscriptionType: string;
}

const JUMP_LINKS = [
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "posts", label: "Posts", icon: FileText },
];

const MANAGE_LINKS = [
  { tab: "create-post", label: "New Post", icon: PlusCircle },
  { tab: "my-thoughts", label: "Thoughts", icon: MessageCircle },
  { tab: "create-thought", label: "New Thought", icon: PlusCircle },
  { tab: "edit", label: "Edit Profile", icon: UserCog },
  { tab: "settings", label: "Settings", icon: Settings2 },
  { tab: "analytics", label: "Analytics", icon: BarChart2 },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DashboardSidebar({ activeTab, onTabChange, isVerified, subscriptionType }: Props) {
  const goToManage = (tab: string) => {
    onTabChange(tab);
    scrollTo("manage");
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-20 self-start w-[240px] shrink-0">
      {/* Jump nav */}
      <nav className="bg-white rounded-xl border border-slate-100 shadow-sm p-2">
        {JUMP_LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => scrollTo(l.id)}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#6C78DF]/10 hover:text-[#30337A] transition-all"
          >
            <l.icon size={18} className="text-slate-500" />
            {l.label}
          </button>
        ))}
      </nav>

      {/* Manage */}
      <nav className="bg-white rounded-xl border border-slate-100 shadow-sm p-2">
        <div className="px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Manage</div>
        {MANAGE_LINKS.map((l) => (
          <button
            key={l.tab}
            onClick={() => goToManage(l.tab)}
            className={`w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === l.tab ? "bg-[#6C78DF]/10 text-[#30337A]" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <l.icon size={18} className={activeTab === l.tab ? "text-[#6C78DF]" : "text-slate-500"} />
            {l.label}
          </button>
        ))}
      </nav>

      {/* Account status */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Account Status</p>
        <div className="flex items-center gap-2 text-sm text-slate-700 mb-2.5">
          <BadgeCheck size={16} className={isVerified ? "text-[#6C78DF]" : "text-slate-300"} />
          {isVerified ? "Verified" : "Not verified"}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Crown size={16} className={subscriptionType ? "text-[#6C78DF]" : "text-slate-300"} />
          {subscriptionType || "Free plan"}
        </div>
        <button
          onClick={() => goToManage("settings")}
          className="mt-3 text-xs font-semibold text-[#6C78DF] hover:text-[#30337A] transition"
        >
          Manage account →
        </button>
      </div>
    </aside>
  );
}
