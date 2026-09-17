"use client";

interface TripSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function TripSearch({ value, onChange, placeholder = "Search by Trip ID, traveler name, email, or destination…" }: TripSearchProps) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-800/70 pl-9 pr-3.5 py-2 text-xs font-medium text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
      />
      <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
    </div>
  );
}
