"use client";

import type { Destination } from "../../lib/types";

interface TripFiltersProps {
  status: string;
  onStatusChange: (val: string) => void;
  destinationId: string;
  onDestinationChange: (val: string) => void;
  destinationsList: Destination[];
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  minBudget: string;
  onMinBudgetChange: (val: string) => void;
  maxBudget: string;
  onMaxBudgetChange: (val: string) => void;
  onReset: () => void;
}

export default function TripFilters({
  status,
  onStatusChange,
  destinationId,
  onDestinationChange,
  destinationsList,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  minBudget,
  onMinBudgetChange,
  maxBudget,
  onMaxBudgetChange,
  onReset,
}: TripFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Trip Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Trip Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming (Planned)</option>
            <option value="ONGOING">Ongoing (Active)</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Destination Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination</label>
          <select
            value={destinationId}
            onChange={(e) => onDestinationChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Destinations</option>
            {destinationsList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.country})
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* End Date Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-3">
        {/* Budget Range Inputs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Budget Range ($):</span>
          <input
            type="number"
            placeholder="Min $"
            min="0"
            value={minBudget}
            onChange={(e) => onMinBudgetChange(e.target.value)}
            className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="number"
            placeholder="Max $"
            min="0"
            value={maxBudget}
            onChange={(e) => onMaxBudgetChange(e.target.value)}
            className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
