"use client";

import AppShell from "../../components/AppShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "../../lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "preferences">("profile");

  // Profile Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Avid traveler exploring culture, cuisine, and new destinations.");

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preference Toggles state
  const [tripAlerts, setTripAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Regional preferences state
  const [currency, setCurrency] = useState("USD");
  const [units, setUnits] = useState("Metric (km, °C)");
  const [language, setLanguage] = useState("English (US)");

  // State messages
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }

    if (typeof window !== "undefined" && user) {
      const updatedUser = { ...user, name: name.trim() };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    setSaveSuccess("Profile settings saved successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!currentPassword) {
      setSaveError("Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setSaveError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveError("New passwords do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaveSuccess("Password updated successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handlePreferencesSave = () => {
    setSaveSuccess("Travel preferences updated!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const signOut = () => {
    setSigningOut(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login");
  };

  return (
    <AppShell>
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl sm:p-10 mb-8 border border-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-extrabold text-indigo-300 border border-indigo-500/30">
              Account Dashboard
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Account Settings</h1>
            <p className="mt-2 text-sm text-indigo-200/80 max-w-xl">
              Manage your profile details, security settings, notifications, and travel preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-xl font-bold text-white shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.name || "Traveler"}</p>
              <p className="text-xs text-indigo-200/70">{user?.email || "user@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon="👤"
            label="Profile Information"
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon="🔒"
            label="Security & Login"
          />
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon="🔔"
            label="Notifications"
          />
          <TabButton
            active={activeTab === "preferences"}
            onClick={() => setActiveTab("preferences")}
            icon="🌐"
            label="Regional Preferences"
          />
        </div>
      </section>

      {/* Global Feedback Banners */}
      {saveSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 flex items-center gap-3 shadow-sm animate-fadeIn">
          <span className="text-lg">✅</span>
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800 flex items-center gap-3 shadow-sm animate-fadeIn">
          <span className="text-lg">⚠️</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Settings Body */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {/* TAB 1: Profile Information */}
          {activeTab === "profile" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">Profile Information</h2>
                <p className="mt-1 text-sm text-slate-500">Update your personal account information and bio.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Account Role
                  </label>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-extrabold text-indigo-700">
                    <span>🛡️</span>
                    <span>{user?.role || "TRAVELER"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Travel Bio / Tagline
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Tell other travelers about your travel interests..."
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Change Password</h2>
                  <p className="mt-1 text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </section>

              {/* Connected OAuth Accounts */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-lg font-extrabold text-slate-900">Connected Accounts</h3>
                <p className="mt-1 text-sm text-slate-500">Sign-in methods linked to your account.</p>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Google OAuth2</h4>
                      <p className="text-xs text-slate-500">Sign in with Google Account enabled</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                    Connected
                  </span>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === "notifications" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">Notification Preferences</h2>
                <p className="mt-1 text-sm text-slate-500">Manage how you receive alerts and updates about your trips.</p>
              </div>

              <div className="space-y-6">
                <ToggleRow
                  icon="✈️"
                  title="Trip Updates & Changes"
                  description="Receive email alerts when itinerary items or trip schedules are updated."
                  checked={tripAlerts}
                  onChange={() => setTripAlerts(!tripAlerts)}
                />
                <ToggleRow
                  icon="🌤️"
                  title="Destination Weather Alerts"
                  description="Get daily weather forecasts sent prior to your trip start date."
                  checked={weatherAlerts}
                  onChange={() => setWeatherAlerts(!weatherAlerts)}
                />
                <ToggleRow
                  icon="💸"
                  title="Budget & Expense Notifications"
                  description="Receive notifications when expenses exceed your planned budget threshold."
                  checked={budgetAlerts}
                  onChange={() => setBudgetAlerts(!budgetAlerts)}
                />
                <ToggleRow
                  icon="📢"
                  title="Travel Tips & Newsletter"
                  description="Receive curated destination guides and special feature announcements."
                  checked={marketingEmails}
                  onChange={() => setMarketingEmails(!marketingEmails)}
                />
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handlePreferencesSave}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  Save Notification Preferences
                </button>
              </div>
            </section>
          )}

          {/* TAB 4: Regional Preferences */}
          {activeTab === "preferences" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">Regional & Travel Preferences</h2>
                <p className="mt-1 text-sm text-slate-500">Configure currency, language, and measurement units.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Measurement Units
                  </label>
                  <select
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="Metric (km, °C)">Metric (Kilometers, °C)</option>
                    <option value="Imperial (miles, °F)">Imperial (Miles, °F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Display Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="French">Français (French)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="Japanese">日本語 (Japanese)</option>
                    <option value="German">Deutsch (German)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handlePreferencesSave}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  Save Regional Preferences
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Summary & Sign Out */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              🟢
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">Session Security</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your account is signed in securely with an active encrypted session.
            </p>
            <div className="mt-4 rounded-xl bg-emerald-50/70 p-3 border border-emerald-100 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800">Active & Secured Session</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">Account Management</h3>
            <p className="mt-1 text-xs text-slate-500">Sign out of your active TripNest session.</p>

            <button
              onClick={signOut}
              disabled={signingOut}
              className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "🚪 Sign Out of TripNest"}
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
        active
          ? "bg-white text-indigo-950 shadow-md"
          : "bg-white/10 text-indigo-100 hover:bg-white/20"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{icon}</span>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
