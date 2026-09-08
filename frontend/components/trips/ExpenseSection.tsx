"use client";

import { useEffect, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getExpenseCategorySummary,
  getExpenses,
  getRemainingBudget,
  updateExpense,
  updateTrip,
} from "../../lib/api";
import CategoryChart from "./CategoryChart";
import type {
  CategorySummary,
  CreateExpenseRequest,
  Expense,
  ExpenseCategory,
  RemainingBudget,
  Trip,
} from "../../lib/types";

interface ExpenseSectionProps {
  trip: Trip;
  onTripUpdated?: () => void;
}

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; icon: string; bg: string }> = {
  TRANSPORTATION: { label: "Transportation", icon: "🚗", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  HOTEL: { label: "Hotel", icon: "🏨", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  FOOD: { label: "Food", icon: "🍔", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  SHOPPING: { label: "Shopping", icon: "🛍️", bg: "bg-pink-50 text-pink-700 border-pink-200" },
  ENTERTAINMENT: { label: "Entertainment", icon: "🎬", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MISCELLANEOUS: { label: "Miscellaneous", icon: "📦", bg: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function ExpenseSection({ trip, onTripUpdated }: ExpenseSectionProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [remainingBudget, setRemainingBudget] = useState<RemainingBudget | null>(null);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Expense Form state
  const [category, setCategory] = useState<ExpenseCategory>("FOOD");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [receiptLink, setReceiptLink] = useState<string>("");
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Budget Form state
  const [newBudget, setNewBudget] = useState<string>(trip.budget ? String(trip.budget) : "");
  const [submittingBudget, setSubmittingBudget] = useState(false);

  const fetchExpenseData = async () => {
    setLoading(true);
    setError("");
    try {
      const [expensesData, budgetData, summaryData] = await Promise.all([
        getExpenses(trip.id),
        getRemainingBudget(trip.id),
        getExpenseCategorySummary(trip.id),
      ]);
      setExpenses(expensesData);
      setRemainingBudget(budgetData);
      setCategorySummaries(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses and budget info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [trip.id]);

  const openAddModal = () => {
    setEditingExpense(null);
    setCategory("FOOD");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setReceiptLink("");
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setDate(expense.date ? expense.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    setReceiptLink(expense.receiptLink || "");
    setIsExpenseModalOpen(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid positive expense amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setSubmittingExpense(true);
    setError("");
    setSuccess("");

    const payload: CreateExpenseRequest = {
      category,
      amount: Number(amount),
      date,
      receiptLink: receiptLink.trim() || undefined,
    };

    try {
      if (editingExpense) {
        await updateExpense(trip.id, editingExpense.id, payload);
        setSuccess("Expense updated successfully!");
      } else {
        await createExpense(trip.id, payload);
        setSuccess("Expense added successfully!");
      }
      setIsExpenseModalOpen(false);
      await fetchExpenseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteExpense(trip.id, expenseId);
      setSuccess("Expense deleted successfully!");
      await fetchExpenseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense.");
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = Number(newBudget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setError("Budget amount must not be negative.");
      return;
    }

    setSubmittingBudget(true);
    setError("");
    setSuccess("");

    try {
      await updateTrip(trip.id, {
        title: trip.title,
        destinationId: trip.destination.id,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: parsedBudget,
        notes: trip.notes,
      });
      setSuccess("Trip budget updated successfully!");
      setIsBudgetModalOpen(false);
      if (onTripUpdated) onTripUpdated();
      await fetchExpenseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update budget.");
    } finally {
      setSubmittingBudget(false);
    }
  };

  const totalBudget = remainingBudget ? remainingBudget.totalBudget : Number(trip.budget || 0);
  const totalSpent = remainingBudget ? remainingBudget.totalExpenses : 0;
  const remaining = remainingBudget ? remainingBudget.remainingBudget : totalBudget;
  const spentPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const isOverBudget = remaining < 0;

  return (
    <section className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">💰 Budget & Expenses</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track expenses, manage budgets, and view category breakdowns in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewBudget(trip.budget ? String(trip.budget) : "");
              setIsBudgetModalOpen(true);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ✏️ Update Budget
          </button>
          <button
            onClick={openAddModal}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {/* Budget Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatCurrency(totalBudget)}</p>
          <p className="mt-1 text-xs text-slate-500">Official trip target</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatCurrency(totalSpent)}</p>
          <p className="mt-1 text-xs text-slate-500">{expenses.length} expense entries recorded</p>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            isOverBudget
              ? "border-rose-200 bg-rose-50/60 text-rose-900"
              : "border-emerald-200 bg-emerald-50/60 text-emerald-900"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">Remaining Budget</p>
          <p className="mt-1 text-2xl font-extrabold">
            {formatCurrency(remaining)}
          </p>
          <p className="mt-1 text-xs font-medium opacity-80">
            {isOverBudget ? "⚠️ Exceeded total budget" : "Available funds remaining"}
          </p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      {totalBudget > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 mb-2">
            <span>Budget Utilization</span>
            <span>{spentPercent}% spent ({formatCurrency(totalSpent)} of {formatCurrency(totalBudget)})</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget ? "bg-rose-500" : spentPercent > 80 ? "bg-amber-500" : "bg-indigo-600"
              }`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Breakdown & Chart Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Category Breakdown & Distribution
        </h3>
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Category Pills Grid */}
          <div className="lg:col-span-7 grid gap-3 sm:grid-cols-2">
            {categorySummaries.length > 0 ? (
              categorySummaries.map((cat) => {
                const meta = CATEGORY_MAP[cat.category] || CATEGORY_MAP.MISCELLANEOUS;
                return (
                  <div
                    key={cat.category}
                    className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm ${meta.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <span className="text-sm font-extrabold">{meta.label}</span>
                    </div>
                    <span className="text-sm font-extrabold">{formatCurrency(cat.totalAmount)}</span>
                  </div>
                );
              })
            ) : (
              <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-500 text-xs font-semibold">
                No category summaries available yet.
              </div>
            )}
          </div>

          {/* Dynamic Category Spending Chart */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Spending Distribution
            </h4>
            <CategoryChart summaries={categorySummaries} />
          </div>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-extrabold text-slate-900 mb-4">Expense Records</h3>

        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-slate-400">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading expenses…
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <span className="text-4xl">🧾</span>
            <h4 className="mt-3 text-base font-extrabold text-slate-900">No Expenses Recorded</h4>
            <p className="mt-1 text-sm text-slate-500">
              No expenses have been added to this trip yet.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Payer</th>
                  <th className="pb-3 pr-4">Receipt</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => {
                  const meta = CATEGORY_MAP[expense.category] || CATEGORY_MAP.MISCELLANEOUS;
                  return (
                    <tr key={expense.id} className="group transition hover:bg-slate-50/60">
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${meta.bg}`}>
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-extrabold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 font-medium">
                        {expense.date ? formatDate(expense.date) : "N/A"}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 font-medium">
                        {expense.payerName || "Trip Member"}
                      </td>
                      <td className="py-3.5 pr-4">
                        {expense.receiptLink ? (
                          <a
                            href={expense.receiptLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:underline"
                          >
                            🔗 View Receipt
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(expense)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="FOOD">Food</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="e.g. 850.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Receipt Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/receipt.pdf"
                  value={receiptLink}
                  onChange={(e) => setReceiptLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submittingExpense}
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingExpense ? "Saving…" : editingExpense ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Update Trip Budget</h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Budget Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 50000.00"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submittingBudget}
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBudget}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingBudget ? "Saving…" : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val || 0);
}

function formatDate(val: string) {
  if (!val) return "";
  return new Date(`${val.split("T")[0]}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
