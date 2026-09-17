"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addCustomPackingItem,
  deletePackingItem,
  getPackingChecklist,
  regeneratePackingChecklist,
  updatePackingItem,
} from "../../lib/api";
import type { PackingCategory, PackingChecklistResponse, PackingItem, Trip } from "../../lib/types";

const CATEGORY_MAP: Record<PackingCategory, { label: string; icon: string; bg: string }> = {
  CLOTHING: { label: "Clothing", icon: "👔", bg: "bg-blue-50 border-blue-100 text-blue-900" },
  RAIN_PROTECTION: { label: "Rain Protection", icon: "☔", bg: "bg-cyan-50 border-cyan-100 text-cyan-900" },
  FOOTWEAR: { label: "Footwear", icon: "👟", bg: "bg-emerald-50 border-emerald-100 text-emerald-900" },
  HEALTH: { label: "Health & Toiletries", icon: "💊", bg: "bg-rose-50 border-rose-100 text-rose-900" },
  DOCUMENTS: { label: "Travel Documents", icon: "📄", bg: "bg-amber-50 border-amber-100 text-amber-900" },
  ELECTRONICS: { label: "Electronics & Tech", icon: "🔌", bg: "bg-indigo-50 border-indigo-100 text-indigo-900" },
  ACCESSORIES: { label: "Accessories & Gear", icon: "🕶️", bg: "bg-purple-50 border-purple-100 text-purple-900" },
  OTHER: { label: "Other Essentials", icon: "📦", bg: "bg-slate-50 border-slate-200 text-slate-900" },
};

export default function SmartPackingChecklist({ trip }: { trip: Trip }) {
  const [checklist, setChecklist] = useState<PackingChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  // Form state for adding custom item
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<PackingCategory>("OTHER");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const fetchChecklist = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPackingChecklist(trip.id);
      setChecklist(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load packing checklist.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [trip.id]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const updated = await regeneratePackingChecklist(trip.id);
      setChecklist(updated);
      toast.success("Packing checklist updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to regenerate packing suggestions.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleItem = async (item: PackingItem) => {
    if (!checklist) return;
    const newStatus = !item.packed;

    // Optimistic UI update
    setChecklist({
      ...checklist,
      packedItems: newStatus ? checklist.packedItems + 1 : checklist.packedItems - 1,
      items: checklist.items.map((i) => (i.id === item.id ? { ...i, packed: newStatus } : i)),
    });

    try {
      await updatePackingItem(trip.id, item.id, newStatus);
    } catch {
      // Rollback on failure
      fetchChecklist();
      toast.error("Failed to update item.");
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customName.trim()) return;

    setIsAddingItem(true);
    try {
      await addCustomPackingItem(trip.id, customName.trim(), customCategory);
      setCustomName("");
      setCustomCategory("OTHER");
      toast.success(`"${customName.trim()}" added.`);
      await fetchChecklist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number, name: string) => {
    try {
      await deletePackingItem(trip.id, itemId);
      toast.success(`"${name}" removed from checklist.`);
      await fetchChecklist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item.");
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        Generating smart weather-aware packing checklist…
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
        ⚠️ {error}
      </section>
    );
  }

  if (!checklist) return null;

  const total = checklist.totalItems;
  const packed = checklist.packedItems;
  const progressPercent = total > 0 ? Math.round((packed / total) * 100) : 0;

  // Group items by category
  const categoriesList: PackingCategory[] = [
    "CLOTHING",
    "RAIN_PROTECTION",
    "FOOTWEAR",
    "HEALTH",
    "DOCUMENTS",
    "ELECTRONICS",
    "ACCESSORIES",
    "OTHER",
  ];

  const groupedItems = categoriesList.reduce((acc, cat) => {
    acc[cat] = checklist.items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<PackingCategory, PackingItem[]>);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      {/* Section Header & Weather Summary Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">🧳</span>
            <h2 className="text-xl font-black text-slate-900">Smart Packing Checklist</h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-extrabold text-indigo-700">
              Weather-Aware
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated recommendations based on destination forecast, temperature, and trip duration.
          </p>
        </div>

        <button
          disabled={regenerating}
          onClick={handleRegenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {regenerating ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔄 Regenerate Suggestions</span>
            </>
          )}
        </button>
      </div>

      {/* Weather Forecast Banner */}
      <div
        className={`flex flex-col justify-between gap-3 rounded-2xl border p-4.5 sm:flex-row sm:items-center ${
          checklist.weatherAvailable
            ? "border-sky-200 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 text-sky-950"
            : "border-amber-200 bg-amber-50/80 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {checklist.weatherAvailable ? (checklist.weatherCondition?.toLowerCase().includes("rain") ? "🌧️" : "🌤️") : "⚠️"}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-75">Destination Weather</p>
            <p className="text-sm font-black mt-0.5">{checklist.weatherSummary}</p>
          </div>
        </div>

        {checklist.weatherAvailable && (
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-white/80 border border-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900">
            <span>📍 {trip.destination?.name || "Destination"}</span>
          </div>
        )}
      </div>

      {/* Packing Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-2">
          <span>Packing Progress</span>
          <span>
            {packed} of {total} items packed ({progressPercent}%)
          </span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grouped Categories List */}
      <div className="grid gap-6 md:grid-cols-2">
        {categoriesList.map((cat) => {
          const catItems = groupedItems[cat] || [];
          if (catItems.length === 0) return null;
          const meta = CATEGORY_MAP[cat];

          return (
            <div
              key={cat}
              className={`rounded-2xl border p-5 shadow-sm space-y-3 ${meta.bg}`}
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  <h3 className="font-black text-sm">{meta.label}</h3>
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-extrabold">
                  {catItems.filter((i) => i.packed).length}/{catItems.length}
                </span>
              </div>

              <ul className="space-y-2.5">
                {catItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-white/90 p-3 shadow-2xs border border-black/5 transition hover:bg-white"
                  >
                    <label className="flex cursor-pointer items-start gap-3 select-none flex-1">
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => handleToggleItem(item)}
                        className="mt-0.5 h-4.5 w-4.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-0.5">
                        <span
                          className={`text-xs font-bold leading-tight block ${
                            item.packed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.reason && (
                          <span className="text-[11px] text-slate-500 font-medium block leading-snug">
                            💡 {item.reason}
                          </span>
                        )}
                      </div>
                    </label>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.custom && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-700">
                          Custom
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="text-slate-400 hover:text-red-600 transition text-xs p-1"
                        title="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Add Custom Packing Item Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 border shadow-2xs">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
          + Add Custom Item to Packing List
        </h4>

        <form onSubmit={handleAddCustomItem} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            required
            placeholder="e.g. Swimming Goggles, Camera, Power Adapter"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as PackingCategory)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="CLOTHING">Clothing</option>
            <option value="RAIN_PROTECTION">Rain Protection</option>
            <option value="FOOTWEAR">Footwear</option>
            <option value="HEALTH">Health & Toiletries</option>
            <option value="DOCUMENTS">Travel Documents</option>
            <option value="ELECTRONICS">Electronics & Tech</option>
            <option value="ACCESSORIES">Accessories & Gear</option>
            <option value="OTHER">Other Essentials</option>
          </select>

          <button
            type="submit"
            disabled={isAddingItem}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
          >
            {isAddingItem ? "Adding..." : "+ Add Item"}
          </button>
        </form>
      </div>
    </section>
  );
}
