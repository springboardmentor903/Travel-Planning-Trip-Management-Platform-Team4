import { useEffect, useState } from "react";
import { Sparkles, Calendar, Clock, MapPin, Check, ArrowRight, RotateCcw, X, Utensils, Compass, DollarSign, Car, AlertTriangle, Lightbulb, PieChart, Loader2, Moon } from "lucide-react";
import type { Trip, SmartItineraryRequest, ItinerarySuggestionResponse, ApplyItinerarySuggestionsRequest } from "../../lib/types";
import { getItinerarySuggestions, applyItinerarySuggestions } from "../../lib/api";

const TRAVEL_STYLES = [
  "Adventure",
  "Relaxation",
  "Culture",
  "Food",
  "Nature",
  "Luxury",
];

const INTERESTS_OPTIONS = [
  "Historical Places",
  "Museums",
  "Beaches",
  "Mountains",
  "Shopping",
  "Local Food",
  "Photography",
  "Adventure",
  "Nightlife",
  "Architecture",
  "Wildlife",
];

const PACE_CARDS = [
  { id: "Relaxed", icon: "🐢", title: "Relaxed", desc: "2-3 major activities per day" },
  { id: "Balanced", icon: "⚖️", title: "Balanced", desc: "3-5 activities per day" },
  { id: "Packed", icon: "⚡", title: "Packed", desc: "Make the most of every day" },
];

const BUDGET_OPTIONS = ["Budget", "Moderate", "Premium", "Luxury"];

const TRANSPORT_OPTIONS = ["Walking", "Public Transport", "Taxi", "Rental Vehicle"];

const ROTATING_MESSAGES = [
  "Finding famous places...",
  "Discovering hidden gems...",
  "Organizing your days...",
  "Optimizing your travel route...",
  "Preparing your personalized itinerary...",
];

export default function SmartItineraryModal({
  isOpen,
  trip,
  onClose,
  onApplied,
}: {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [step, setStep] = useState<"FORM" | "PREVIEW">("FORM");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState("");

  // Preference Form States
  const [travelStyle, setTravelStyle] = useState<string>("Culture");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Historical Places", "Local Food"]);
  const [budgetPreference, setBudgetPreference] = useState<string>("Moderate");
  const [pace, setPace] = useState<string>("Balanced");
  const [transportationPreference, setTransportationPreference] = useState<string>("Public Transport");

  // Generated Travel Assistant Response
  const [suggestion, setSuggestion] = useState<ItinerarySuggestionResponse | null>(null);
  const [applying, setApplying] = useState(false);

  // Editable itinerary state for preview review
  const [editableDays, setEditableDays] = useState<any[]>([]);
  const [editingActTarget, setEditingActTarget] = useState<{ dayIdx: number; actIdx: number } | null>(null);

  // Sync suggestion itinerary into editable state
  useEffect(() => {
    if (suggestion?.itinerary) {
      setEditableDays(JSON.parse(JSON.stringify(suggestion.itinerary)));
    }
  }, [suggestion]);

  // Rotating loading messages timer
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [loading]);

  if (!isOpen) return null;

  // Calculate trip duration in days
  const calculateDays = () => {
    if (!trip.startDate || !trip.endDate) return 1;
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const totalDaysCount = calculateDays();

  // Calculate total places discovered
  const placesCount = suggestion?.recommendations
    ? Object.values(suggestion.recommendations).flat().length
    : (suggestion?.itinerary?.reduce((acc, d) => acc + (d.activities?.length || 0), 0) || 0);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const reqData: SmartItineraryRequest = {
        travelStyle,
        interests: selectedInterests,
        budgetPreference,
        pace,
        preferredStartTime: "Morning",
        transportationPreference,
        foodPreference: "Local Specialties",
      };
      const res = await getItinerarySuggestions(trip.id, reqData);
      setSuggestion(res);
      setStep("PREVIEW");
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI travel suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Activity editing helpers
  const handleRemoveActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...editableDays];
    updated[dayIdx].activities.splice(actIdx, 1);
    setEditableDays(updated);
  };

  const handleMoveActivity = (fromDayIdx: number, actIdx: number, toDayIdx: number) => {
    if (fromDayIdx === toDayIdx) return;
    const updated = [...editableDays];
    const [moved] = updated[fromDayIdx].activities.splice(actIdx, 1);
    updated[toDayIdx].activities.push(moved);
    setEditableDays(updated);
  };

  const handleAddCustomActivity = (dayIdx: number) => {
    const updated = [...editableDays];
    updated[dayIdx].activities.push({
      name: "New Custom Activity",
      category: "Activity",
      description: "Custom scheduled activity",
      location: trip.destination?.name || "Local Destination",
      startTime: "11:00",
      endTime: "12:00",
      estimatedDuration: "1 hour",
      estimatedCost: "Free",
    });
    setEditableDays(updated);
    setEditingActTarget({ dayIdx, actIdx: updated[dayIdx].activities.length - 1 });
  };

  const handleUpdateActivityField = (dayIdx: number, actIdx: number, field: string, value: string) => {
    const updated = [...editableDays];
    updated[dayIdx].activities[actIdx][field] = value;
    setEditableDays(updated);
  };

  // Time category helper
  const getSlotCategory = (timeStr?: string, index?: number): "Morning" | "Afternoon" | "Evening" => {
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2}):/);
      if (match) {
        const hour = parseInt(match[1], 10);
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        return "Evening";
      }
    }
    const idx = index || 0;
    if (idx < 2) return "Morning";
    if (idx < 4) return "Afternoon";
    return "Evening";
  };

  const groupActivitiesByTimeSlot = (activities: any[]) => {
    const morning: any[] = [];
    const afternoon: any[] = [];
    const evening: any[] = [];

    activities.forEach((act, idx) => {
      const slot = getSlotCategory(act.startTime, idx);
      if (slot === "Morning") morning.push({ act, origIdx: idx });
      else if (slot === "Afternoon") afternoon.push({ act, origIdx: idx });
      else evening.push({ act, origIdx: idx });
    });

    return { morning, afternoon, evening };
  };

  const handleApplyReviewed = async () => {
    if (!suggestion) return;
    setApplying(true);
    setError("");
    try {
      const payload: ApplyItinerarySuggestionsRequest = {
        days: editableDays.map((day) => ({
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title,
          description: day.description,
          activities: day.activities.map((act: any) => ({
            title: act.name,
            name: act.name,
            description: act.description,
            location: act.location,
            startTime: act.startTime,
            endTime: act.endTime,
          })),
        })),
      };
      await applyItinerarySuggestions(trip.id, payload);
      onApplied();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to apply smart itinerary suggestions.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {step === "FORM" ? "Let's Plan Your Trip" : "Your Personalized Trip Plan"}
              </h2>
              <p className="text-xs text-slate-500">
                {step === "FORM"
                  ? "Tell us how you like to travel and we'll create personalized suggestions."
                  : "Here's a suggested itinerary based on your destination and preferences."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || applying}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="relative p-6 max-h-[75vh] overflow-y-auto">
          {/* Rotating Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs p-6 text-center animate-in fade-in duration-200">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 border border-indigo-100 shadow-md mb-4">
                <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-indigo-600 opacity-30" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 transition-all duration-300">
                {ROTATING_MESSAGES[loadingMsgIdx]}
              </h4>
              <p className="mt-1 text-xs text-slate-400">Personalizing itinerary for {trip.destination?.name || "your trip"}…</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          {step === "FORM" ? (
            <div className="space-y-6">
              {/* Trip Context Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4 text-xs text-indigo-950">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-indigo-700 font-bold block">Destination</span>
                    <strong className="font-extrabold text-slate-900 truncate block">
                      {trip.destination?.name || "Target City"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-indigo-700 font-bold block">Dates</span>
                    <strong className="font-extrabold text-slate-900 block truncate">
                      {trip.startDate} - {trip.endDate}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-indigo-700 font-bold block">Duration</span>
                    <strong className="font-extrabold text-slate-900 block">
                      {totalDaysCount} Day{totalDaysCount === 1 ? "" : "s"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-indigo-700 font-bold block">Budget</span>
                    <strong className="font-extrabold text-slate-900 block truncate">
                      {trip.budget ? `₹${trip.budget.toLocaleString()}` : "Not specified"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Travel Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-indigo-600" />
                  Travel Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      disabled={loading}
                      onClick={() => setTravelStyle(style)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        travelStyle === style
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: What interests you? */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  What interests you? (Multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_OPTIONS.map((interest) => {
                    const selected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        disabled={loading}
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          selected
                            ? "bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-indigo-600" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Travel Pace */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Travel Pace
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PACE_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      disabled={loading}
                      onClick={() => setPace(card.id)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition ${
                        pace === card.id
                          ? "border-amber-500 bg-amber-50/70 shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-lg mb-1">{card.icon}</span>
                      <h4 className="text-xs font-extrabold text-slate-900">{card.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{card.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4 & 5: Budget Preference & Transportation Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* SECTION 4: Budget Preference */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    Budget Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGET_OPTIONS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        disabled={loading}
                        onClick={() => setBudgetPreference(b)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                          budgetPreference === b
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: Transportation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-blue-600" />
                    Transportation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSPORT_OPTIONS.map((tr) => (
                      <button
                        key={tr}
                        type="button"
                        disabled={loading}
                        onClick={() => setTransportationPreference(tr)}
                        className={`rounded-xl px-2.5 py-2 text-[11px] font-bold transition ${
                          transportationPreference === tr
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW STEP: REVIEW DASHBOARD & EDITABLE TIMELINE */
            <div className="space-y-6">
              {/* Top Summary Cards Grid (4 Stats) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                  <MapPin className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Recommended Places</span>
                  <strong className="text-xs font-extrabold text-slate-900">{placesCount} Discovered</strong>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                  <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Trip Duration</span>
                  <strong className="text-xs font-extrabold text-slate-900">{suggestion?.totalDays || totalDaysCount} Days</strong>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                  <DollarSign className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Estimated Budget</span>
                  <strong className="text-xs font-extrabold text-slate-900 truncate block">
                    {suggestion?.budgetInsights?.totalEstimatedCost || "Approx. ₹" + (trip.budget || 25000)}
                  </strong>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center">
                  <Compass className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Travel Style</span>
                  <strong className="text-xs font-extrabold text-slate-900">{travelStyle}</strong>
                </div>
              </div>

              {/* Day-by-Day Timeline Schedule */}
              <div className="space-y-6">
                {editableDays.map((day, dayIdx) => {
                  const slots = groupActivitiesByTimeSlot(day.activities || []);

                  return (
                    <div key={day.dayNumber || dayIdx} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                      {/* Day Header */}
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                              DAY {day.dayNumber}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900">{day.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{day.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {day.date && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                              {day.date}
                            </span>
                          )}
                          <button
                            onClick={() => handleAddCustomActivity(dayIdx)}
                            className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            <span>+ Add Activity</span>
                          </button>
                        </div>
                      </div>

                      {/* Time Slot Timeline Blocks */}
                      <div className="space-y-4">
                        {/* ☕ MORNING */}
                        {slots.morning.length > 0 && (
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2">
                              <span>☕</span> MORNING
                            </span>
                            <div className="space-y-2">
                              {slots.morning.map(({ act, origIdx }) => (
                                <ActivityCardItem
                                  key={origIdx}
                                  act={act}
                                  dayIdx={dayIdx}
                                  actIdx={origIdx}
                                  totalDays={editableDays.length}
                                  isEditing={editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx}
                                  onToggleEdit={() => {
                                    if (editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx) {
                                      setEditingActTarget(null);
                                    } else {
                                      setEditingActTarget({ dayIdx, actIdx: origIdx });
                                    }
                                  }}
                                  onUpdate={handleUpdateActivityField}
                                  onRemove={handleRemoveActivity}
                                  onMove={handleMoveActivity}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ☀️ AFTERNOON */}
                        {slots.afternoon.length > 0 && (
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 flex items-center gap-1.5 mb-2">
                              <span>☀️</span> AFTERNOON
                            </span>
                            <div className="space-y-2">
                              {slots.afternoon.map(({ act, origIdx }) => (
                                <ActivityCardItem
                                  key={origIdx}
                                  act={act}
                                  dayIdx={dayIdx}
                                  actIdx={origIdx}
                                  totalDays={editableDays.length}
                                  isEditing={editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx}
                                  onToggleEdit={() => {
                                    if (editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx) {
                                      setEditingActTarget(null);
                                    } else {
                                      setEditingActTarget({ dayIdx, actIdx: origIdx });
                                    }
                                  }}
                                  onUpdate={handleUpdateActivityField}
                                  onRemove={handleRemoveActivity}
                                  onMove={handleMoveActivity}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 🌙 EVENING */}
                        {slots.evening.length > 0 && (
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-2">
                              <span>🌙</span> EVENING
                            </span>
                            <div className="space-y-2">
                              {slots.evening.map(({ act, origIdx }) => (
                                <ActivityCardItem
                                  key={origIdx}
                                  act={act}
                                  dayIdx={dayIdx}
                                  actIdx={origIdx}
                                  totalDays={editableDays.length}
                                  isEditing={editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx}
                                  onToggleEdit={() => {
                                    if (editingActTarget?.dayIdx === dayIdx && editingActTarget?.actIdx === origIdx) {
                                      setEditingActTarget(null);
                                    } else {
                                      setEditingActTarget({ dayIdx, actIdx: origIdx });
                                    }
                                  }}
                                  onUpdate={handleUpdateActivityField}
                                  onRemove={handleRemoveActivity}
                                  onMove={handleMoveActivity}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SMART TIPS & WARNINGS SECTION */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                    Smart Tips & Advice
                  </h4>
                </div>
                <ul className="space-y-2 text-xs font-medium text-indigo-950 pl-2">
                  <li className="flex items-start gap-2">
                    <span>💡</span>
                    <span>Start Day 1 early to avoid crowds at popular spots.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📍</span>
                    <span>Most Day 2 locations are within comfortable walking distance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>💰</span>
                    <span>Consider public transport or walking to reduce daily transit expenses.</span>
                  </li>
                  {suggestion?.warnings && suggestion.warnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-900 font-semibold">
                      <span>⚠️</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-[#FAFAF9]">
          {step === "FORM" ? (
            <>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? "Generating Itinerary…" : "✨ Generate My Itinerary"}</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("FORM")}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back to Preferences
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              <button
                onClick={handleApplyReviewed}
                disabled={applying}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <ArrowRight className="h-4 w-4" />
                <span>{applying ? "Applying to Trip…" : "Apply to My Itinerary"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Activity Card Sub-Component with Inline Editing & Actions
function ActivityCardItem({
  act,
  dayIdx,
  actIdx,
  totalDays,
  isEditing,
  onToggleEdit,
  onUpdate,
  onRemove,
  onMove,
}: {
  act: any;
  dayIdx: number;
  actIdx: number;
  totalDays: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (dayIdx: number, actIdx: number, field: string, value: string) => void;
  onRemove: (dayIdx: number, actIdx: number) => void;
  onMove: (fromDayIdx: number, actIdx: number, toDayIdx: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs transition hover:border-slate-200">
      {isEditing ? (
        <div className="space-y-2.5 bg-white p-3 rounded-xl border border-indigo-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400">Activity Name</label>
              <input
                type="text"
                value={act.name || ""}
                onChange={(e) => onUpdate(dayIdx, actIdx, "name", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400">Location</label>
              <input
                type="text"
                value={act.location || ""}
                onChange={(e) => onUpdate(dayIdx, actIdx, "location", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400">Start Time</label>
              <input
                type="text"
                value={act.startTime || ""}
                onChange={(e) => onUpdate(dayIdx, actIdx, "startTime", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400">End Time</label>
              <input
                type="text"
                value={act.endTime || ""}
                onChange={(e) => onUpdate(dayIdx, actIdx, "endTime", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400">Description</label>
            <textarea
              rows={2}
              value={act.description || ""}
              onChange={(e) => onUpdate(dayIdx, actIdx, "description", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onToggleEdit}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white"
            >
              Done Editing
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900">{act.name}</span>
              {act.category && (
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {act.category}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{act.description}</p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-semibold">
              {(act.startTime || act.endTime) && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {act.startTime} {act.endTime ? `- ${act.endTime}` : ""}
                </span>
              )}

              {act.estimatedDuration && (
                <span className="text-slate-500">
                  ⏱️ {act.estimatedDuration}
                </span>
              )}

              {act.estimatedCost && (
                <span className="text-emerald-600 font-bold">
                  💰 {act.estimatedCost}
                </span>
              )}

              {act.location && (
                <span className="flex items-center gap-1 truncate text-slate-500">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {act.location}
                </span>
              )}
            </div>
          </div>

          {/* Activity Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Target Day Selector */}
            <select
              value={dayIdx}
              onChange={(e) => onMove(dayIdx, actIdx, parseInt(e.target.value, 10))}
              className="rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 py-1 px-1.5 focus:outline-none"
              title="Move activity to another day"
            >
              {Array.from({ length: totalDays }, (_, i) => (
                <option key={i} value={i}>
                  Day {i + 1}
                </option>
              ))}
            </select>

            <button
              onClick={onToggleEdit}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:text-indigo-600 transition"
              title="Edit activity"
            >
              <RotateCcw className="h-3 w-3" />
            </button>

            <button
              onClick={() => onRemove(dayIdx, actIdx)}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 hover:text-rose-600 transition"
              title="Remove activity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
