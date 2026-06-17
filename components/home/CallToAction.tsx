import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const BENEFITS = [
  "Free listing — no setup fees",
  "Reach customers in 64 districts",
  "Get calls, views & reviews",
  "Verified business badge",
];

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
              <Sparkles size={12} className="text-yellow-300" /> For Businesses
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Grow Your Business<br />with AaramBD
            </h2>
            <p className="text-blue-200 text-base mb-8 leading-relaxed">
              Join thousands of businesses and service providers who are reaching
              new customers every day across Bangladesh.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="h-11 px-6 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2">
                  List Your Business — Free <ArrowRight size={15} />
                </button>
              </Link>
              <Link href="/businesses">
                <button className="h-11 px-6 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl transition-all text-sm">
                  Explore Businesses
                </button>
              </Link>
            </div>
          </div>

          {/* Right — benefit card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-8">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-5">
              What you get
            </p>
            <ul className="space-y-3.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-white">
                  <CheckCircle2 size={17} className="text-cyan-300 flex-shrink-0" />
                  <span className="text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-4">
              <div className="text-4xl font-extrabold text-cyan-300">10K+</div>
              <div>
                <p className="text-white font-bold text-sm">businesses already listed</p>
                <p className="text-blue-200 text-xs mt-0.5">Join them today, it&apos;s free</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
