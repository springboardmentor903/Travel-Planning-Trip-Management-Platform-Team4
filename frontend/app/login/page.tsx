"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";
import { motion } from "framer-motion";
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        })
      );

      router.push("/dashboard");
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
      {/* LEFT SIDE - IMMERSIVE CINEMATIC TRAVEL VISUAL */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-[#111827] overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Landscape"
            className="h-full w-full object-cover opacity-60 filter contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-[#111827]/30" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Plane className="h-5 w-5 text-indigo-300" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TripNest</span>
        </div>

        {/* Floating Destination Tags */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <div className="flex flex-wrap gap-2.5">
            {["Paris 🇫🇷", "Tokyo 🇯🇵", "Bali 🇮🇩", "New York 🇺🇸"].map((dest, i) => (
              <motion.span
                key={dest}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20 shadow-xs"
              >
                📍 {dest}
              </motion.span>
            ))}
          </div>

          <blockquote className="space-y-3">
            <p className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-snug">
              “Every journey starts with a dream.”
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Plan unforgettable experiences around the world with personalized itineraries and real-time travel insights.
            </p>
          </blockquote>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} TripNest Platform. Crafted for modern wanderers.
        </div>
      </div>

      {/* RIGHT SIDE - MINIMAL AUTH PANEL */}
      <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-white">
              <Plane className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold text-[#111827]">TripNest</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">Welcome back 👋</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#6B7280]">
              Continue your journey with TripNest.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 pl-10 pr-4 text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-[#4338CA] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 pl-10 pr-10 text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#4338CA] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E5E7EB] text-[#4338CA] focus:ring-indigo-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4338CA] py-3.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#3730A3] transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">OR</span>
            <div className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          {/* Social Login Button */}
          <button
            type="button"
            onClick={() => setError("Google Sign In requires SSO server configuration.")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white py-3 text-xs sm:text-sm font-semibold text-[#111827] shadow-2xs hover:bg-[#FAFAF9] transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="mt-8 text-center text-xs text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-[#4338CA] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
