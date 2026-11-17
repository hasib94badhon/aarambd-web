"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe, CheckCircle2, TrendingUp, Star, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  website: string;
  facebook: string;
}

const STEPS = [
  {
    icon: CheckCircle2,
    title: "Get listed, free",
    body: "Create your business profile with photos, a description, and your contact number. No cost to join.",
  },
  {
    icon: Megaphone,
    title: "Build your reputation",
    body: "Post updates, get discovered in search and category browsing, and earn reviews from real customers.",
  },
  {
    icon: TrendingUp,
    title: "Get discovered, pay only when it pays off",
    body: "As your profile gets more calls and views, you become eligible for a visibility upgrade. We'll reach out — you only pay once you're popular enough to benefit.",
  },
];

export default function ForBusinessPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_contact_info")
      .then((r: { data: ContactInfo }) => setContact(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#14163A] via-[#30337A] to-[#6C78DF] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-5">Grow Your Business with AaramBD</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of local businesses getting discovered by customers across Bangladesh —
            no upfront cost, no contracts.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#30337A] font-semibold px-6 py-3 rounded-xl hover:bg-[#6C78DF]/10 transition-all shadow-lg"
          >
            List Your Business Free
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="w-11 h-11 rounded-xl bg-[#6C78DF]/10 flex items-center justify-center text-[#6C78DF] mb-4">
                <s.icon size={22} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Step {i + 1}</p>
              <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why join */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">Why Businesses Choose AaramBD</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <Star className="mx-auto text-amber-500 mb-3" size={28} />
              <h3 className="font-bold text-slate-900 mb-1">Build Trust</h3>
              <p className="text-sm text-slate-500">Real customer reviews and a verified badge once you're a subscriber.</p>
            </div>
            <div>
              <TrendingUp className="mx-auto text-[#6C78DF] mb-3" size={28} />
              <h3 className="font-bold text-slate-900 mb-1">Reach More Customers</h3>
              <p className="text-sm text-slate-500">Show up in category browsing, search, and the community feed.</p>
            </div>
            <div>
              <Megaphone className="mx-auto text-emerald-600 mb-3" size={28} />
              <h3 className="font-bold text-slate-900 mb-1">Share Updates</h3>
              <p className="text-sm text-slate-500">Post photos and news that reach people actively looking for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Have Questions?</h2>
        <p className="text-center text-slate-500 mb-10">
          Reach out to the AaramBD team directly — we're happy to help you get set up.
        </p>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : contact ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-[#6C78DF] transition">
                <Phone size={18} className="text-[#6C78DF] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-[#6C78DF] transition">
                <Mail size={18} className="text-[#6C78DF] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{contact.email}</span>
              </a>
            )}
            {contact.address && (
              <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <MapPin size={18} className="text-[#6C78DF] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{contact.address}</span>
              </div>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-[#6C78DF] transition">
                <Globe size={18} className="text-[#6C78DF] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate">{contact.website}</span>
              </a>
            )}
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-[#6C78DF] transition">
                <Globe size={18} className="text-[#6C78DF] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">Facebook Page</span>
              </a>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">Contact details are temporarily unavailable.</p>
        )}
      </section>
    </div>
  );
}
