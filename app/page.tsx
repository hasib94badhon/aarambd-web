"use client";

import { useEffect, useState } from "react";
import LeftSidebar from "@/components/home/LeftSidebar";
import CenterFeed from "@/components/home/CenterFeed";
import RightSidebar from "@/components/home/RightSidebar";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const { isLoggedIn, user, hydrate } = useAuthStore();
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [activeSubCat, setActiveSubCat] = useState<number | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
      <div className="flex gap-4 items-start">
        <LeftSidebar
          activeCat={activeCat}
          activeSubCat={activeSubCat}
          onSelectCat={setActiveCat}
          onSelectSubCat={setActiveSubCat}
          isLoggedIn={isLoggedIn}
          user={user}
        />
        <CenterFeed
          activeCat={activeCat}
          activeSubCat={activeSubCat}
          isLoggedIn={isLoggedIn}
          user={user}
        />
        <RightSidebar isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
