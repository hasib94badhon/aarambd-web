"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/lib/api";

export default function TermsPage() {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get("/get_terms_policy")
      .then((r) => setText(r.data.terms_policy ?? ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <FileText size={20} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Terms &amp; Privacy Policy</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      ) : !text ? (
        <p className="text-gray-400 text-sm">Terms &amp; policy document not available.</p>
      ) : (
        <div className="prose prose-sm prose-gray max-w-none">
          <p className="text-gray-700 leading-loose whitespace-pre-line">{text}</p>
        </div>
      )}
    </div>
  );
}
