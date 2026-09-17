"use client";

import React from "react";
import type { UserDetailsDTO } from "../../lib/types";

interface UserDetailsModalProps {
  userDetails: UserDetailsDTO | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({
  userDetails,
  isOpen,
  loading,
  onClose,
}: UserDetailsModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (val: number | undefined) => {
    const num = val != null ? Number(val) : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-300 font-bold">
              {userDetails?.name ? userDetails.name.slice(0, 2).toUpperCase() : "👤"}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {loading ? "Loading User Details..." : userDetails?.name}
              </h3>
              <p className="text-xs text-slate-400">{userDetails?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-400">Fetching detailed traveler metrics...</p>
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Role</span>
                <span className="text-sm font-extrabold text-indigo-400 mt-1 block">
                  {userDetails.role || "TRAVELER"}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className={`text-sm font-extrabold mt-1 inline-flex items-center gap-1.5 ${userDetails.active ? "text-emerald-400" : "text-rose-400"}`}>
                  <span className={`w-2 h-2 rounded-full ${userDetails.active ? "bg-emerald-400" : "bg-rose-400"}`} />
                  {userDetails.active ? "Active" : "Deactivated"}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Trips</span>
                <span className="text-sm font-extrabold text-white mt-1 block">
                  {userDetails.tripCount}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Joined Date</span>
                <span className="text-xs font-bold text-slate-300 mt-1 block">
                  {formatDate(userDetails.createdAt)}
                </span>
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="bg-gradient-to-r from-indigo-950/80 to-slate-950 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Total Planned Travel Budget
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {formatCurrency(userDetails.totalPlannedBudget)}
                </p>
              </div>
              <div className="text-3xl text-indigo-400">💳</div>
            </div>

            {/* Account Details Specs */}
            <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono font-bold text-white">#{userDetails.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Authentication Provider:</span>
                <span className="font-semibold text-slate-200">
                  {userDetails.oauthGoogle ? "🌐 Google OAuth2" : "📧 Email / Password"}
                </span>
              </div>
            </div>

            {/* Recent Trips Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Recent Planned Trips ({userDetails.recentTrips?.length || 0})
              </h4>
              {userDetails.recentTrips && userDetails.recentTrips.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userDetails.recentTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">✈️</span>
                        <div>
                          <p className="font-bold text-white">{trip.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {trip.destination?.name}, {trip.destination?.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(trip.budget || 0)}
                        </span>
                        <p className="text-[10px] text-slate-400">{trip.startDate} to {trip.endDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30">
                  <p className="text-xs text-slate-400">No trips created yet by this traveler.</p>
                </div>
              )}
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
