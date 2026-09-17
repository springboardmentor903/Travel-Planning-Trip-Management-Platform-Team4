"use client";

import type { RemainingBudget } from "../../lib/types";

interface BudgetSummaryProps {
  budget: RemainingBudget | null;
  defaultTotal?: number | null;
  className?: string;
}

export default function BudgetSummary({ budget, defaultTotal = 0, className = "" }: BudgetSummaryProps) {
  const total = budget ? budget.totalBudget : Number(defaultTotal || 0);
  const spent = budget ? budget.totalExpenses : 0;
  const remaining = budget ? budget.remainingBudget : total;
  const percent = total > 0 ? Math.min(Math.round((spent / total) * 100), 100) : 0;
  const isOver = remaining < 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Remaining Budget</p>
          <p className={`mt-1 text-2xl font-extrabold ${isOver ? "text-rose-600" : "text-slate-900"}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{formatCurrency(total)}</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Spent: {formatCurrency(spent)}</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${
                isOver ? "bg-rose-500" : percent > 85 ? "bg-amber-500" : "bg-indigo-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
