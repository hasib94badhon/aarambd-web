"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Phone, User, Clock, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface Viewer {
  view_user_id: number;
  view_user_name: string;
  cat_name: string;
  view_user_photo: string;
  total_views: number;
  last_view_time: string;
}

interface Caller {
  call_user_id: number;
  name: string;
  cat_name: string;
  photo: string;
  total_calls: number;
  last_call_time: string;
  direction: "incoming" | "outgoing";
}

interface Props {
  userId: string;
}

export default function ProfileAnalytics({ userId }: Props) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [incoming, setIncoming] = useState<Caller[]>([]);
  const [outgoing, setOutgoing] = useState<Caller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/get_view_list", { params: { user_id: userId, page: 1, page_size: 20 } }),
      api.get("/get_call_list", { params: { user_id: userId, page: 1, page_size: 20 } }),
    ])
      .then(([vRes, cRes]) => {
        setViewers(vRes.data.view_list ?? []);
        setIncoming(cRes.data.incoming_calls ?? []);
        setOutgoing(cRes.data.outgoing_calls ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-4">
        <StatChip icon={<Eye size={16} className="text-[#6C78DF]" />} label="Profile Views" value={viewers.reduce((s, v) => s + v.total_views, 0)} />
        <StatChip icon={<Phone size={16} className="text-[#6C78DF]" />} label="Incoming Calls" value={incoming.reduce((s, c) => s + c.total_calls, 0)} />
        <StatChip icon={<BarChart2 size={16} className="text-purple-500" />} label="Unique Callers" value={incoming.length} />
      </div>

      <Tabs defaultValue="viewers">
        <TabsList className="bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="viewers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 text-sm">
            Who Viewed Me ({viewers.length})
          </TabsTrigger>
          <TabsTrigger value="callers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 text-sm">
            Who Called Me ({incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 text-sm">
            My Calls ({outgoing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewers" className="mt-4">
          <PeopleList
            items={viewers.map((v) => ({
              user_id: v.view_user_id,
              name: v.view_user_name,
              cat_name: v.cat_name,
              photo: v.view_user_photo,
              count: v.total_views,
              time: v.last_view_time,
              countLabel: "views",
              icon: <Eye size={12} className="text-[#8990E8]" />,
            }))}
            emptyMsg="Nobody has viewed your profile yet."
          />
        </TabsContent>

        <TabsContent value="callers" className="mt-4">
          <PeopleList
            items={incoming.map((c) => ({
              user_id: c.call_user_id,
              name: c.name,
              cat_name: c.cat_name,
              photo: c.photo,
              count: c.total_calls,
              time: c.last_call_time,
              countLabel: "calls",
              icon: <Phone size={12} className="text-green-500" />,
            }))}
            emptyMsg="No incoming calls yet."
          />
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          <PeopleList
            items={outgoing.map((c) => ({
              user_id: c.call_user_id,
              name: c.name,
              cat_name: c.cat_name,
              photo: c.photo,
              count: c.total_calls,
              time: c.last_call_time,
              countLabel: "calls",
              icon: <Phone size={12} className="text-gray-400" />,
            }))}
            emptyMsg="You haven't called anyone yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

interface PersonItem {
  user_id: number;
  name: string;
  cat_name: string;
  photo: string;
  count: number;
  time: string;
  countLabel: string;
  icon: React.ReactNode;
}

function PeopleList({ items, emptyMsg }: { items: PersonItem[]; emptyMsg: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-12">{emptyMsg}</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link key={item.user_id} href={`/profile/${item.user_id}`}>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-green-200 hover:shadow-sm transition">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {item.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 truncate">{item.cat_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                {item.icon} {item.count} {item.countLabel}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock size={10} /> {item.time?.split(" ").slice(1, 4).join(" ")}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
