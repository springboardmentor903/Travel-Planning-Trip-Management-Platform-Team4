"use client";

import { useEffect, useState } from "react";
import { getExpenseSettlement, markSettlementAsSettled } from "../../lib/api";
import type { SettlementSummaryResponse, SettlementTransaction } from "../../lib/types";

import { useCurrency } from "../../lib/currency";

export default function ExpenseSettlementCard({
  tripId,
  onSettlementUpdated,
}: {
  tripId: number;
  onSettlementUpdated?: () => void;
}) {
  const { format: formatCurrency } = useCurrency();
  const [summary, setSummary] = useState<SettlementSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchSettlement = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getExpenseSettlement(tripId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlement details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
  }, [tripId]);

  const handleMarkSettled = async (settlementId: number, fromName: string, toName: string, amount: number) => {
    setSettlingId(settlementId);
    setToast(null);
    try {
      await markSettlementAsSettled(tripId, settlementId);
      setToast({
        type: "success",
        message: `Settlement of ${formatCurrency(amount)} from ${fromName} to ${toName} marked as settled!`,
      });
      await fetchSettlement();
      if (onSettlementUpdated) onSettlementUpdated();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to mark transaction as settled.",
      });
    } finally {
      setSettlingId(null);
    }
  };



  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        Calculating group expense settlement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
        ⚠️ {error}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h3 className="text-xl font-black text-slate-900">Group Expense Splitter</h3>
            <span className="rounded-full bg-indigo-100 border border-indigo-200 px-3 py-0.5 text-xs font-extrabold text-indigo-800">
              Equal Split
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automatic minimal transfer algorithm calculates who owes whom across all group members.
          </p>
        </div>

        <button
          onClick={fetchSettlement}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          🔄 Recalculate
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`mt-4 flex items-center justify-between rounded-2xl border p-4 text-xs font-extrabold shadow-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"} {toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 uppercase tracking-wider font-black">
            Dismiss
          </button>
        </div>
      )}

      {/* Top 3 Metric Badges */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Group Spending</p>
          <p className="mt-1 text-xl font-black text-slate-900">{formatCurrency(summary.totalExpenses)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Sum of all recorded trip expenses</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Group Members</p>
          <p className="mt-1 text-xl font-black text-slate-900">{summary.memberCount} Member{summary.memberCount > 1 ? "s" : ""}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Trip owner & registered members</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Equal Share Per Person</p>
          <p className="mt-1 text-xl font-black text-indigo-950">{formatCurrency(summary.equalShare)}</p>
          <p className="mt-0.5 text-[11px] text-indigo-700 font-medium">Target per member</p>
        </div>
      </div>

      {/* Member Balances Section */}
      <div className="mt-7">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Member Balances Breakdown
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.memberBalances.map((mb) => {
            const isCreditor = mb.netBalance > 0.01;
            const isDebtor = mb.netBalance < -0.01;
            return (
              <div
                key={mb.userId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-sm text-slate-900">{mb.userName}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-black border ${
                        isCreditor
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : isDebtor
                          ? "border-rose-200 bg-rose-50 text-rose-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isCreditor
                        ? `+${formatCurrency(mb.netBalance)}`
                        : isDebtor
                        ? `${formatCurrency(mb.netBalance)}`
                        : `Settled`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{mb.userEmail}</p>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Paid:</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(mb.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Should Pay:</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(mb.shouldPay)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Settlement Transfers ("Who Owes Whom") */}
      <div className="mt-8 border-t border-slate-200/80 pt-6">
        <h4 className="text-sm font-black text-slate-900 mb-1">
          Settlement Instructions ("Who owes whom?")
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Minimal transfers recommended to balance all member accounts cleanly.
        </p>

        {summary.pendingSettlements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
            <span className="text-2xl">🎉</span>
            <p className="mt-2 text-sm font-extrabold text-emerald-900">All Expenses Settled!</p>
            <p className="mt-0.5 text-xs text-emerald-700">No pending debt transfers remain for this trip.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.pendingSettlements.map((tx) => (
              <div
                key={tx.id || `${tx.fromUserId}-${tx.toUserId}`}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-800">
                    💸
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      <span className="text-amber-900 font-black">{tx.fromUserName}</span> owes{" "}
                      <span className="text-indigo-900 font-black">{tx.toUserName}</span>{" "}
                      <span className="text-emerald-700 font-black text-base">{formatCurrency(tx.amount)}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Pending transfer • Generated automatically
                    </p>
                  </div>
                </div>

                <button
                  disabled={settlingId === tx.id}
                  onClick={() => handleMarkSettled(tx.id, tx.fromUserName, tx.toUserName, tx.amount)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {settlingId === tx.id ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Settling…</span>
                    </>
                  ) : (
                    <>
                      <span>✓ Mark as Settled</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settled Transactions History */}
        {summary.settledTransactions.length > 0 && (
          <div className="mt-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Completed Settlement History ({summary.settledTransactions.length})
            </h5>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {summary.settledTransactions.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✅</span>
                    <span className="font-extrabold text-slate-900">{st.fromUserName}</span>
                    <span className="text-slate-400">paid</span>
                    <span className="font-extrabold text-slate-900">{st.toUserName}</span>
                    <span className="font-black text-emerald-700">{formatCurrency(st.amount)}</span>
                  </div>
                  {st.settledAt && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Settled on {formatDate(st.settledAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
