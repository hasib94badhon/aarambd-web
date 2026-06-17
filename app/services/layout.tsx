import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | AaramBD",
  description: "Find trusted service providers across Bangladesh on AaramBD — plumbers, tutors, electricians, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
