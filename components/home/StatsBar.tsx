import { Building2, LayoutGrid, MapPin, Users } from "lucide-react";

const STATS = [
  { label: "Registered Businesses", value: "10,000+", icon: Building2, color: "text-blue-600",   bg: "bg-blue-50"   },
  { label: "Service Categories",    value: "100+",    icon: LayoutGrid, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Districts Covered",     value: "64",      icon: MapPin,     color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Monthly Users",         value: "50,000+", icon: Users,      color: "text-emerald-600",bg: "bg-emerald-50"},
];

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="py-7 px-4 sm:px-6 flex flex-col items-center gap-2.5 text-center group"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-200`}
              >
                <s.icon size={22} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
