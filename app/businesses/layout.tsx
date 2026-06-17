import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Businesses | AaramBD",
  description: "Browse verified local businesses across Bangladesh on AaramBD. Find shops, retailers, and merchants near you.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
