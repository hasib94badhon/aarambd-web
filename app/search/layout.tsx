import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | AaramBD",
  description: "Search for businesses, service providers, and categories across Bangladesh on AaramBD.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
