"use client";

import React, { useState } from "react";

interface AnalyticsDateFilterProps {
  timeRange: string;
  onTimeRangeChange: (range: string, from?: string, to?: string) => void;
  customFrom?: string;
  customTo?: string;
}

export default function AnalyticsDateFilter({
  timeRange,
  onTimeRangeChange,
  customFrom = "",
  customTo = "",
}: AnalyticsDateFilterProps) {
  const [showCustom, setShowCustom] = useState(timeRange === "custom");
  const [fromDate, setFromDate] = useState(customFrom);
  const [toDate, setToDate] = useState(customTo);

  const ranges = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "Last Year", value: "1y" },
    { label: "All Time", value: "all" },
    { label: "Custom Range", value: "custom" },
  ];

  const handleSelect = (val: string) => {
    if (val === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onTimeRangeChange(val);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate) {
      onTimeRangeChange("custom", fromDate, toDate);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
          🗓️ Time Range:
        </span>
        {ranges.map((r) => {
          const isActive = timeRange === r.value;
          return (
            <button
              key={r.value}
              onClick={() => handleSelect(r.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <form onSubmit={handleApplyCustom} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
          >
            Apply Dates
          </button>
        </form>
      )}
    </div>
  );
}
