"use client";

import AppShell from "../../components/AppShell";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, Mail, Shield, Check, Lock, Eye, LogOut, KeyRound, AlertCircle, Laptop, Smartphone, Monitor } from "lucide-react";
import { changePassword } from "../../lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  // Settings State
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<"PUBLIC" | "MEMBERS_ONLY" | "PRIVATE">("PUBLIC");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Load user details & settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore parse errors
        }
      }

      const savedInApp = localStorage.getItem("tripnest_inapp_notifications");
      const savedEmail = localStorage.getItem("tripnest_email_notifications");
      const savedVis = localStorage.getItem("tripnest_profile_visibility");
      const saved2FA = localStorage.getItem("tripnest_2fa_enabled");

      if (savedInApp !== null) setInAppNotifications(savedInApp === "true");
      if (savedEmail !== null) setEmailNotifications(savedEmail === "true");
      if (savedVis !== null) setProfileVisibility(savedVis as any);
      if (saved2FA !== null) setTwoFactorEnabled(saved2FA === "true");
    }
  }, []);

  const triggerSaveFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleInAppToggle = () => {
    const nextVal = !inAppNotifications;
    setInAppNotifications(nextVal);
    localStorage.setItem("tripnest_inapp_notifications", String(nextVal));
    triggerSaveFeedback();
  };

  const handleEmailToggle = () => {
    const nextVal = !emailNotifications;
    setEmailNotifications(nextVal);
    localStorage.setItem("tripnest_email_notifications", String(nextVal));
    triggerSaveFeedback();
  };

  const handleVisibilityChange = (val: "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE") => {
    setProfileVisibility(val);
    localStorage.setItem("tripnest_profile_visibility", val);
    triggerSaveFeedback();
  };

  const handle2FAToggle = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    localStorage.setItem("tripnest_2fa_enabled", String(nextVal));
    triggerSaveFeedback();
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPassword) {
      setPwError("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess("Your password was updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwError(err?.message || "Failed to update password. Please verify current password.");
    } finally {
      setPwLoading(false);
    }
  };

  const signOut = () => {
    setSigningOut(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <AppShell>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Account Preferences</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Settings & Security</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account security, password, notification channels, and active sessions.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700 animate-in fade-in duration-200">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Settings Section */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500">Control how and when you receive TripNest updates.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 divide-y divide-slate-100">
              {/* In-App Toggle */}
              <div className="flex items-center justify-between pt-4 first:pt-0">
                <div className="pr-4">
                  <p className="text-sm font-bold text-slate-900">In-App Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Receive live updates for join requests, member additions, and trip changes in the top bell.
                  </p>
                </div>
                <button
                  onClick={handleInAppToggle}
                  type="button"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    inAppNotifications ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                  aria-pressed={inAppNotifications}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      inAppNotifications ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Email Toggle */}
              <div className="flex items-center justify-between pt-4">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send email notifications to {user?.email || "your address"} when members join or modify trips.
                  </p>
                </div>
                <button
                  onClick={handleEmailToggle}
                  type="button"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailNotifications ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                  aria-pressed={emailNotifications}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      emailNotifications ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Privacy & Visibility</h2>
                <p className="text-xs text-slate-500">Manage who can see your profile and trip activity.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Profile Visibility
              </label>
              
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => handleVisibilityChange("PUBLIC")}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                    profileVisibility === "PUBLIC"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold">Public</span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-normal">
                    Visible to all TripNest wanderers
                  </span>
                </button>

                <button
                  onClick={() => handleVisibilityChange("MEMBERS_ONLY")}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                    profileVisibility === "MEMBERS_ONLY"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold">Trip Members</span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-normal">
                    Visible only to fellow trip members
                  </span>
                </button>

                <button
                  onClick={() => handleVisibilityChange("PRIVATE")}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                    profileVisibility === "PRIVATE"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold">Private</span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-normal">
                    Only visible to you
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Update your account security password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="mt-6 space-y-4 max-w-lg">
              {pwError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{pwError}</span>
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 font-medium">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                {pwLoading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          </section>

          {/* Account Session Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Active Account Session</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Signed in as <span className="font-bold text-slate-800">{user?.name || "User"}</span> ({user?.email || "email@tripnest.com"})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={signOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Security Overview Sidebar */}
        <aside className="space-y-6">
          {/* Security Status Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Lock className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Token Active
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-sm">Security Overview</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your account is authenticated via encrypted JWT access tokens with HMAC-SHA256 signatures.
            </p>

            <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Authentication Method</span>
                <span className="font-bold text-slate-900">Bearer JWT</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Token Expiration</span>
                <span className="font-bold text-slate-900">24 Hours</span>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Two-Factor Auth (2FA)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Extra layer of login security</p>
              </div>
              <button
                onClick={handle2FAToggle}
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  twoFactorEnabled ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active Devices Log */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Active Session Device</h3>
            <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Laptop className="h-5 w-5 text-indigo-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Windows Chrome</p>
                <p className="text-[11px] text-slate-500">Current Session • 127.0.0.1</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
