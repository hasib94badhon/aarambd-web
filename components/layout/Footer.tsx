import Link from "next/link";
import { MapPin, Globe } from "lucide-react";

const LINKS = {
  Explore: [
    { href: "/categories", label: "Browse Categories" },
    { href: "/businesses", label: "Businesses" },
    { href: "/services", label: "Services" },
    { href: "/social", label: "Social Spotlight" },
    { href: "/search", label: "Search" },
    { href: "/trending", label: "Trending" },
    { href: "/feed", label: "Feed" },
    { href: "/thoughts", label: "Thoughts & Needs" },
  ],
  Business: [
    { href: "/for-business", label: "List Your Business" },
    { href: "/partner", label: "Become a Field Partner" },
    { href: "/register", label: "Join Free" },
  ],
  Account: [
    { href: "/login", label: "Sign In" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/saved", label: "Saved" },
    { href: "/notifications", label: "Notifications" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-sm leading-none">A</span>
              </div>
              <span className="text-white text-xl font-extrabold tracking-tight">
                Aaram<span className="text-blue-400">BD</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Bangladesh&apos;s digital marketplace. Discover local businesses,
              service providers, and community opportunities in one place.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-blue-400 flex-shrink-0" />
                <span>Serving all 64 districts of Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-blue-400 flex-shrink-0" />
                <span>aarambd.com</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AaramBD. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms"   className="hover:text-blue-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
          </div>
          <p>Made with ❤️ for Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
