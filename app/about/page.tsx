"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Target, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface AboutData {
  about: string;
  founders: string;
  sponsors: string;
  office_address: string;
  contact: string;
  goals: string;
  quote: string;
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_about_info")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AboutSkeleton />;

  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400 text-sm">
        Unable to load about information.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">About AaramBD</h1>
        {data.quote && (
          <blockquote className="relative mt-4">
            <Quote size={28} className="text-green-200 mx-auto mb-2" />
            <p className="text-lg italic text-gray-500 max-w-xl mx-auto leading-relaxed">
              {data.quote}
            </p>
          </blockquote>
        )}
      </div>

      {/* About text */}
      {data.about && (
        <section className="mb-10">
          <p className="text-gray-700 leading-loose whitespace-pre-line">{data.about}</p>
        </section>
      )}

      {/* Goals */}
      {data.goals && (
        <section className="mb-10 bg-green-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Our Goals</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{data.goals}</p>
        </section>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {/* Founders */}
        {data.founders && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Founders</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{data.founders}</p>
          </section>
        )}

        {/* Sponsors */}
        {data.sponsors && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Sponsors</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{data.sponsors}</p>
          </section>
        )}
      </div>

      {/* Contact & Address */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Get In Touch</h2>
        <div className="space-y-3">
          {data.office_address && (
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{data.office_address}</span>
            </div>
          )}
          {data.contact && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone size={16} className="text-blue-500 flex-shrink-0" />
              <span>{data.contact}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      <Skeleton className="h-10 w-56 mx-auto" />
      <Skeleton className="h-5 w-80 mx-auto" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid sm:grid-cols-2 gap-6">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  );
}
