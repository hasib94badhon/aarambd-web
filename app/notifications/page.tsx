"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, User, Eye, Phone, MessageCircle, Share2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Notification {
  user_name: string;
  message: string;
  type: string;
  created_at: string;
  user_pic: string;
  is_read: boolean;
  user_id: number;
  detail_post_id: string;
  service_id: number;
  shop_id: number;
  is_service: boolean | null;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  view: <Eye size={14} className="text-blue-500" />,
  call: <Phone size={14} className="text-blue-600" />,
  comment: <MessageCircle size={14} className="text-purple-500" />,
  share: <Share2 size={14} className="text-orange-500" />,
  review: <Star size={14} className="text-yellow-500" />,
};

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const { user, isLoggedIn, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !isLoggedIn || !user) {
      setLoading(false);
      return;
    }
    api
      .get("/get_notifications", { params: { user_id: user.user_id, page: 1, page_size: PAGE_SIZE } })
      .then((r) => {
        const items: Notification[] = r.data.notifications ?? [];
        setNotifications(items);
        setHasMore(items.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hydrated, isLoggedIn, user]);

  const loadMore = async () => {
    if (!user) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const r = await api.get("/get_notifications", {
        params: { user_id: user.user_id, page: nextPage, page_size: PAGE_SIZE },
      });
      const items: Notification[] = r.data.notifications ?? [];
      setNotifications((prev) => [...prev, ...items]);
      setPage(nextPage);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-3">
        <Skeleton className="h-8 w-44 mb-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Bell size={24} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-400 max-w-xs">Login to see your notifications.</p>
        <Link href="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login to Continue</Button>
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await api.post("/mark_notifications_read", { user_id: String(user.user_id) });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      /* silent */
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Bell size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-blue-600 hover:text-green-800 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <NotifItem key={i} notif={n} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotifItem({ notif }: { notif: Notification }) {
  const icon = TYPE_ICON[notif.type] ?? <Bell size={14} className="text-gray-400" />;
  const dateStr = notif.created_at
    ? new Date(notif.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition ${
        notif.is_read ? "bg-white border-gray-100" : "bg-blue-50 border-blue-100"
      }`}
    >
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
        {notif.user_pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={notif.user_pic} alt={notif.user_name} className="w-full h-full object-cover" />
        ) : (
          <User size={14} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {icon}
          <Link
            href={`/profile/${notif.user_id}`}
            className="text-sm font-semibold text-gray-900 hover:text-blue-700 transition truncate"
          >
            {notif.user_name}
          </Link>
          {!notif.is_read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
        <p className="text-xs text-gray-400 mt-1">{dateStr}</p>
      </div>
    </div>
  );
}
