import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Privacy Policy | AaramBD",
  description: "Read AaramBD's terms of service and privacy policy.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
