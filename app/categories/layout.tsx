import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | AaramBD",
  description: "Browse all business and service categories on AaramBD — Bangladesh's digital marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
