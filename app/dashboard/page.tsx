"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, MessageCircle, UserCog, Settings2, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import Gallery from "@/components/dashboard/Gallery";
import MyPosts from "@/components/dashboard/MyPosts";
import EditProfile from "@/components/dashboard/EditProfile";
import AccountSettings from "@/components/dashboard/AccountSettings";
import CreatePost from "@/components/dashboard/CreatePost";
import CreateThought from "@/components/dashboard/CreateThought";
import MyThoughts from "@/components/dashboard/MyThoughts";
import ProfileAnalytics from "@/components/dashboard/ProfileAnalytics";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const PAGE_SIZE = 10;

interface DashboardUser {
  user_id: string;
  name: string;
  phone: string;
  description: string;
  cat_id: number;
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
  call_status: number;
}

interface PostItem {
  post_id: string;
  post_description: string;
  post_media: string[];
  post_time: string;
  post_viewed: number;
  post_comments: number;
  main_description?: string;
}

interface AccountInfo {
  email: string;
  phone: string;
}

export default function DashboardPage() {
  const { isLoggedIn, user, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace("/login");
  }, [hydrated, isLoggedIn, router]);

  if (!hydrated || !isLoggedIn || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#6C78DF]" />
      </div>
    );
  }

  return <DashboardContent phone={user.phone} userId={String(user.user_id)} />;
}

function DashboardContent({ phone, userId }: { phone: string; userId: string }) {
  const [profile, setProfile] = useState<DashboardUser | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/get_user_by_phone", {
        params: { phone, page: 1, page_size: PAGE_SIZE },
      });
      setProfile({
        user_id: data.user_id,
        name: data.name,
        phone: data.phone ?? phone,
        description: data.description,
        cat_id: data.cat_id,
        cat_name: data.cat_name,
        photo: data.photo,
        location: data.location,
        user_viewed: data.user_viewed,
        user_called: data.user_called,
        user_shared: data.user_shared,
        user_total_post: data.user_total_post,
        nid: data.nid,
        tin: data.tin,
        subscription_type: data.subscription_type ?? "",
        call_status: data.call_status ?? 0,
      });
      setPosts(data.posts ?? []);
      setHasMorePosts((data.posts?.length ?? 0) === PAGE_SIZE);
    } catch {
      // handled in loading state
    }
  }, [phone]);

  const loadAccountInfo = useCallback(async () => {
    try {
      const { data } = await api.get("/account_settings", { params: { user_id: userId } });
      setAccountInfo({ email: data.email ?? "", phone: data.phone ?? phone });
    } catch {
      setAccountInfo({ email: "", phone });
    }
  }, [userId, phone]);

  useEffect(() => {
    Promise.all([loadProfile(), loadAccountInfo()]).finally(() => setLoading(false));
  }, [loadProfile, loadAccountInfo]);

  const loadMorePosts = async () => {
    setLoadingMore(true);
    const next = postsPage + 1;
    try {
      const { data } = await api.get("/get_user_by_phone", {
        params: { phone, page: next, page_size: PAGE_SIZE },
      });
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setPostsPage(next);
      setHasMorePosts((data.posts?.length ?? 0) === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.post_id !== postId));
    setProfile((prev) =>
      prev ? { ...prev, user_total_post: Math.max(0, prev.user_total_post - 1) } : prev
    );
  };

  const handlePostEdited = (postId: string, newMainDesc: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.post_id === postId ? { ...p, main_description: newMainDesc } : p))
    );
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile header card */}
      {profile && <ProfileHeader user={profile} />}

      {/* Gallery */}
      <Gallery posts={posts} />

      {/* Posts */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-4">Posts</h2>
        <MyPosts
          posts={posts}
          hasMore={hasMorePosts}
          onLoadMore={loadMorePosts}
          loadingMore={loadingMore}
          onDeleted={handlePostDeleted}
          onEdited={handlePostEdited}
        />
      </div>

      {/* Manage */}
      <Tabs defaultValue="create-post">
        <TabsList className="bg-gray-100 rounded-xl p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="create-post" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <PlusCircle size={14} /> New Post
          </TabsTrigger>
          <TabsTrigger value="my-thoughts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <MessageCircle size={14} /> Thoughts
          </TabsTrigger>
          <TabsTrigger value="create-thought" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <PlusCircle size={14} /> New Thought
          </TabsTrigger>
          <TabsTrigger value="edit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <UserCog size={14} /> Edit Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <Settings2 size={14} /> Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-2 text-sm font-medium flex items-center gap-1.5">
            <BarChart2 size={14} /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-post" className="mt-6">
          <CreatePost phone={phone} onCreated={loadProfile} />
        </TabsContent>

        <TabsContent value="my-thoughts" className="mt-6">
          <MyThoughts userId={userId} />
        </TabsContent>

        <TabsContent value="create-thought" className="mt-6">
          <CreateThought userId={userId} />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {profile && (
            <EditProfile
              phone={phone}
              initialName={profile.name}
              initialDescription={profile.description}
              initialCatId={profile.cat_id}
              initialPhoto={profile.photo}
            />
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {accountInfo && profile && (
            <AccountSettings
              userId={userId}
              initialEmail={accountInfo.email}
              phone={accountInfo.phone}
              initialCallStatus={profile.call_status}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProfileAnalytics userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="rounded-[28px] bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF] p-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-28 h-28 rounded-2xl bg-white/15" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48 bg-white/15" />
            <Skeleton className="h-4 w-32 bg-white/15" />
          </div>
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
