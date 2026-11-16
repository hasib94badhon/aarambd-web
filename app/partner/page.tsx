"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

interface Instructions {
  english: string;
  bangla: string;
}

export default function PartnerPage() {
  const [data, setData] = useState<Instructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"english" | "bangla">("english");

  useEffect(() => {
    publicApi
      .get("/get_data_collector_instructions")
      .then((r: { data: Instructions }) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <Users size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Become an AaramBD Field Partner</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            Help local shops and service providers get discovered — and earn for every
            verified business you bring onto the platform.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
            <MapPin className="mx-auto text-emerald-600 mb-2" size={22} />
            <p className="text-sm font-bold text-slate-900">Work Your Area</p>
            <p className="text-xs text-slate-500 mt-1">Sign up businesses in your own neighborhood.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
            <Award className="mx-auto text-emerald-600 mb-2" size={22} />
            <p className="text-sm font-bold text-slate-900">Earn Points</p>
            <p className="text-xs text-slate-500 mt-1">Get rewarded for every verified business you onboard.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
            <Users className="mx-auto text-emerald-600 mb-2" size={22} />
            <p className="text-sm font-bold text-slate-900">Help Your Community</p>
            <p className="text-xs text-slate-500 mt-1">Give local shops real visibility online.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full rounded" />)}
            </div>
          ) : data && (data.english || data.bangla) ? (
            <>
              {data.bangla && (
                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setLang("english")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                      lang === "english" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang("bangla")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                      lang === "bangla" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {lang === "bangla" && data.bangla ? data.bangla : data.english}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">
              Partner instructions are temporarily unavailable. Contact AaramBD directly to get started.
            </p>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/for-business"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Contact AaramBD to get started →
          </Link>
        </div>
      </section>
    </div>
  );
}
