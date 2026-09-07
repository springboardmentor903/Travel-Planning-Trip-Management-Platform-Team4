"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, User, Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, MapPin } from "lucide-react";

const TRAVELER_TYPES = [
  { id: "beach", label: "Beach Wanderer", icon: "🏖", desc: "Sun, sand & relaxing ocean vibes" },
  { id: "adventure", label: "Adrenaline Seeker", icon: "🏔", desc: "Hiking, climbing & wild outdoors" },
  { id: "city", label: "City Explorer", icon: "🏙", desc: "Architecture, culture & nightlife" },
  { id: "nature", label: "Nature Lover", icon: "🌿", desc: "Forests, national parks & serenity" },
  { id: "food", label: "Foodie Traveler", icon: "🍜", desc: "Local street food & fine dining" },
];

const DREAM_DESTINATIONS = [
  { id: "paris", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80" },
  { id: "tokyo", name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80" },
  { id: "switzerland", name: "Swiss Alps", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80" },
  { id: "bali", name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" },
  { id: "newyork", name: "New York", country: "United States", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80" },
  { id: "maldives", name: "Maldives", country: "Indian Ocean", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=400&q=80" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Onboarding Selection State
  const [selectedTravelerTypes, setSelectedTravelerTypes] = useState<string[]>(["beach", "city"]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["paris", "tokyo"]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleType = (id: string) => {
    setSelectedTravelerTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      setError("Full name is required.");
      return false;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setSuccessMsg("Welcome aboard! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAFAF9] text-[#111827] font-sans antialiased">
      {/* LEFT SIDE - EDITORIAL HERO COVER */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative bg-[#111827] overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="Travel Onboarding"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/50 to-[#111827]/20" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Plane className="h-5 w-5 text-indigo-300" />
          </div>
          <span className="text-xl font-bold text-white">TripNest</span>
        </div>

        {/* Dynamic Step Text */}
        <div className="relative z-10 my-auto py-12 max-w-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Step {step} of 3</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            {step === 1 && "Start Your Global Journey"}
            {step === 2 && "Personalize Your Travel Style"}
            {step === 3 && "Discover Dream Destinations"}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
            {step === 1 && "Create your TripNest account to save trips, build itineraries, and split expenses effortlessly."}
            {step === 2 && "Tell us what excites you most so we can tailor travel spot recommendations."}
            {step === 3 && "Select your top dream bucket list locations to populate your dashboard."}
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE - ONBOARDING STEP FORM */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] mb-3">
              <span className={step >= 1 ? "text-[#4338CA]" : ""}>01 Account</span>
              <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? "bg-[#4338CA]" : "bg-[#E5E7EB]"}`} />
              <span className={step >= 2 ? "text-[#4338CA]" : ""}>02 Style</span>
              <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? "bg-[#4338CA]" : "bg-[#E5E7EB]"}`} />
              <span className={step >= 3 ? "text-[#4338CA]" : ""}>03 Bucket List</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700">
              {successMsg}
            </div>
          )}

          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-[#111827]">Create your account</h3>
                <p className="text-xs text-[#6B7280] mt-1">Enter your details to get started.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4338CA] py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#3730A3] transition"
                >
                  <span>Continue to Preferences</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TRAVELER TYPE SELECTION */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-[#111827]">What kind of traveler are you?</h3>
                <p className="text-xs text-[#6B7280] mt-1">Select all styles that match your vibe.</p>
              </div>

              <div className="space-y-3">
                {TRAVELER_TYPES.map((type) => {
                  const selected = selectedTravelerTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition duration-200 ${
                        selected
                          ? "border-[#4338CA] bg-indigo-50/50 shadow-2xs"
                          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[#111827]">{type.label}</p>
                        <p className="text-[11px] text-[#6B7280]">{type.desc}</p>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#D1D5DB]"
                      }`}>
                        {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs font-semibold text-[#6B7280] hover:bg-[#FAFAF9]"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-semibold text-white hover:bg-[#3730A3]"
                >
                  <span>Next: Bucket List</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DREAM DESTINATIONS */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-[#111827]">Where do you dream of going?</h3>
                <p className="text-xs text-[#6B7280] mt-1">Pick places you want to visit first.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {DREAM_DESTINATIONS.map((dest) => {
                  const selected = selectedDestinations.includes(dest.id);
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => toggleDestination(dest.id)}
                      className={`group relative overflow-hidden rounded-xl border text-left transition duration-200 ${
                        selected ? "border-2 border-[#4338CA] shadow-md" : "border-[#E5E7EB]"
                      }`}
                    >
                      <div className="h-24 w-full overflow-hidden bg-slate-100">
                        <img src={dest.image} alt={dest.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="text-xs font-bold">{dest.name}</p>
                        <p className="text-[10px] text-white/80">{dest.country}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs font-semibold text-[#6B7280] hover:bg-[#FAFAF9]"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#3730A3] transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Start Exploring</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          <p className="mt-8 text-center text-xs text-[#6B7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#4338CA] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
