import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed | AaramBD",
  description: "Browse the latest posts and updates from businesses and service providers on AaramBD.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
