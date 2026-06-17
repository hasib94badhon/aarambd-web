import { Search, UserCheck, Phone, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Search or Browse",
    desc: "Find businesses and services by name, category, or location across Bangladesh.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "View Profiles",
    desc: "Read reviews, check posts, view stats, and compare providers side by side.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
  },
  {
    icon: Phone,
    step: "03",
    title: "Connect Directly",
    desc: "Call or save businesses you trust — no middlemen, no fees.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1 rounded-full">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            How AaramBD Works
          </h2>
          <p className="text-slate-500 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
            Finding the right local business has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-8">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative group">
              {/* Arrow connector — desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex absolute top-11 -right-3 lg:-right-5 z-10">
                  <ArrowRight size={16} className="text-slate-300" />
                </div>
              )}

              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                <div
                  className={`w-14 h-14 rounded-2xl ${s.bg} ring-4 ${s.ring} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}
                >
                  <s.icon size={26} className={s.color} />
                </div>
                <div className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-1.5">
                  Step {s.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
