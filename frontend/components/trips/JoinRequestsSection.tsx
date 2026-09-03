"use client";

import { useEffect, useState } from "react";
import { approveJoinRequest, getPendingJoinRequests, rejectJoinRequest } from "../../lib/api";
import type { JoinRequestResponse } from "../../lib/types";

interface JoinRequestsSectionProps {
  tripId: number | string;
  canManage: boolean;
  onMemberAdded?: () => void;
}

export default function JoinRequestsSection({
  tripId,
  canManage,
  onMemberAdded,
}: JoinRequestsSectionProps) {
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    if (!canManage) return;
    setLoading(true);
    setError("");
    try {
      const data = await getPendingJoinRequests(tripId);
      setRequests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load join requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId && canManage) {
      fetchRequests();
    }
  }, [tripId, canManage]);

  if (!canManage) return null;
  if (!loading && requests.length === 0) return null;

  const handleApprove = async (requestId: number, userName: string) => {
    setProcessingId(requestId);
    setError("");
    setSuccessMsg("");
    try {
      await approveJoinRequest(tripId, requestId);
      setSuccessMsg(`Approved join request for ${userName}. They are now a trip member.`);
      await fetchRequests();
      if (onMemberAdded) onMemberAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve join request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number, userName: string) => {
    setProcessingId(requestId);
    setError("");
    setSuccessMsg("");
    try {
      await rejectJoinRequest(tripId, requestId);
      setSuccessMsg(`Rejected join request for ${userName}.`);
      await fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject join request.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-amber-950">
            <span>📩</span> Pending Join Requests ({requests.length})
          </h2>
          <p className="mt-1 text-sm text-amber-800/80">Review traveler requests to join this trip</p>
        </div>
        <button
          onClick={fetchRequests}
          className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100/50"
        >
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-6 text-center text-sm font-semibold text-amber-900">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
          Loading pending requests…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((req) => {
            const isProcessing = processingId === req.requestId;

            return (
              <div
                key={req.requestId}
                className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-900">{req.name}</p>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                      PENDING
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{req.email}</p>
                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    Requested: {formatDateTime(req.createdAt)}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprove(req.requestId, req.name)}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing…" : "✓ Approve"}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleReject(req.requestId, req.name)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing…" : "✕ Reject"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
