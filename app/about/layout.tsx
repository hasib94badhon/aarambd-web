import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | AaramBD",
  description: "Learn about AaramBD — our mission, founders, and vision for Bangladesh's digital marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
