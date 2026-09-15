"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import type { AuthResponse } from "../../lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const validateForm = (): boolean => {
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
    return true;
  };

  const handleAuthSuccess = (data: AuthResponse) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
    );
    router.replace("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await login({ email: email.trim(), password });
      handleAuthSuccess(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Background Glows & Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-fuchsia-600/15 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl shadow-indigo-950/50">
          
          {/* Left Panel: Hero & Visual Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between h-full min-h-[520px] rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950 border border-indigo-500/20 shadow-inner">
            {/* Background Decorative Image / Gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                Next-Gen Travel Platform
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-4 leading-tight">
                Plan Unforgettable Journeys with <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">TripNest</span>
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Discover curated destinations, manage smart trip itineraries, track real-time weather forecasts, and sync your travel plans seamlessly.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="relative z-10 space-y-3 my-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/30 flex items-center justify-center text-xl text-indigo-300 shrink-0">
                  🗺️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">15+ Handcrafted Destinations</h4>
                  <p className="text-[11px] text-slate-400">Interactive maps & localized insights</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-violet-600/30 flex items-center justify-center text-xl text-violet-300 shrink-0">
                  🌤️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Weather Forecasts</h4>
                  <p className="text-[11px] text-slate-400">Stay prepared for every climate</p>
                </div>
              </div>
            </div>

            {/* User Testimonial Footer */}
            <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                  <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">SK</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">AL</div>
                </div>
                <span className="font-semibold text-slate-200">10,000+ Happy Travelers</span>
              </div>
              <span className="text-indigo-400 font-bold">★ 4.9 Rating</span>
            </div>
          </div>

          {/* Right Panel: Clean Modern Auth Form */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center px-2 sm:px-4">
            {/* Logo & Header */}
            <div className="text-center lg:text-left mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-indigo-400/40 mb-4 shadow-lg shadow-indigo-600/30 animate-float">
                <span className="text-2xl">✈️</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Sign in to manage your travel itineraries & trips
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
                <span className="text-base">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="mb-5">
              <GoogleSignInButton
                onSuccess={handleAuthSuccess}
                onError={(msg) => setError(msg)}
                buttonText="Sign in with Google"
              />
            </div>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative px-3.5 bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider rounded-md">
                Or continue with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="sreekarkn007@gmail.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 text-sm shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 014.285-4.662M9.88 9.88a3 3 0 104.24 4.24M15 12a3 3 0 00-3-3m0-4.5A10.05 10.05 0 0122 12s-3 7-10 7a10.05 10.05 0 01-4.875-1.175M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 gradient-btn text-white font-semibold text-sm rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Email</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
              >
                Register here
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

