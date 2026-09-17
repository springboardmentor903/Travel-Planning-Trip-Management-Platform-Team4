"use client";

import { CurrencyCode, SUPPORTED_CURRENCIES, useCurrency } from "../lib/currency";
import { DollarSign, RefreshCw } from "lucide-react";

export default function CurrencySelector({ className = "" }: { className?: string }) {
  const { selectedCurrency, setSelectedCurrency, isConverted } = useCurrency();

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div className="relative inline-block">
        <select
          aria-label="Select Currency"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
          className="appearance-none rounded-xl border border-slate-200 bg-white/90 py-1.5 pl-8 pr-7 text-xs font-bold text-slate-800 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} ({c.name})
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600">
          {SUPPORTED_CURRENCIES[selectedCurrency]?.symbol || "₹"}
        </span>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
          ▼
        </span>
      </div>

      {isConverted && (
        <span
          title="Conversion rate is approximate. Stored database amounts remain unchanged."
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200"
        >
          <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" /> Approx. Rate
        </span>
      )}
    </div>
  );
}
