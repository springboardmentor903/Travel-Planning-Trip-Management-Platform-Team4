"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "../../lib/api";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import type { AuthResponse } from "../../lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setSuccessMsg(null);

    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMsg(
        data.message || "Account registered successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Background Glows & Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none animate-pulse-glow" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl shadow-indigo-950/50">
          
          {/* Left Panel: Hero Showcase */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between h-full min-h-[560px] rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-violet-950/80 via-slate-900/90 to-slate-950 border border-violet-500/20 shadow-inner">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                Start Your Journey
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-4 leading-tight">
                Create Your Free Account on <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">TripNest</span>
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Join thousands of travelers planning seamless adventures around the globe.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="relative z-10 space-y-3 my-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-violet-600/30 flex items-center justify-center text-xl text-violet-300 shrink-0">
                  ✨
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Trip Planner</h4>
                  <p className="text-[11px] text-slate-400">Organize itineraries with start & end dates</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/30 flex items-center justify-center text-xl text-indigo-300 shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Account Activation</h4>
                  <p className="text-[11px] text-slate-400">Zero wait time. Start exploring right away.</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">🛡️ 100% Secure & Private</span>
              <span className="text-violet-400 font-bold">Free Forever</span>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center px-2 sm:px-4">
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 border border-violet-400/40 mb-3 shadow-lg shadow-violet-600/30 animate-float">
                <span className="text-2xl">🌍</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Join TripNest
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Create an account to start planning your journeys
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg animate-fadeIn">
                <span className="text-sm">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 shadow-lg animate-fadeIn">
                <span className="text-sm">✅</span>
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="mb-4">
              <GoogleSignInButton
                onSuccess={handleAuthSuccess}
                onError={(msg) => setError(msg)}
                buttonText="Register with Google"
              />
            </div>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative px-3.5 bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider rounded-md">
                Or register with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="register-name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="register-email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="register-password">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Min 6 chars"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="register-confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
                >
                  <span>{showPassword ? "🙈 Hide Passwords" : "👁️ Show Passwords"}</span>
                </button>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 gradient-btn text-white font-semibold text-sm rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

