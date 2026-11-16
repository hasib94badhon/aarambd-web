import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AaramBD — Bangladesh's Digital Marketplace",
  description:
    "Discover local businesses, service providers, shops, and community opportunities across Bangladesh. AaramBD connects people with solutions.",
  keywords: "Bangladesh marketplace, local business, service providers, AaramBD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased overflow-x-hidden">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
