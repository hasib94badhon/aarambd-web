import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending | AaramBD",
  description: "Discover the most viewed and contacted businesses on AaramBD right now.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
