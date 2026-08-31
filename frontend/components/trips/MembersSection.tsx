"use client";

import { useEffect, useState } from "react";
import { addTripMember, changeTripMemberRole, getTripMembers, removeTripMember } from "../../lib/api";
import type { MembershipRole, TripMemberResponse } from "../../lib/types";

interface MembersSectionProps {
  tripId: number | string;
  ownerId?: number;
  ownerEmail?: string;
}

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
};

export default function MembersSection({ tripId, ownerId, ownerEmail }: MembersSectionProps) {
  const [members, setMembers] = useState<TripMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Current user authentication context
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Remove confirmation modal state
  const [removeTarget, setRemoveTarget] = useState<TripMemberResponse | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Role change pending state
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTripMembers(tripId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trip members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchMembers();
    }
  }, [tripId]);

  // Determine current user's role on this trip
  const isOwner =
    (ownerId != null && currentUser?.id === ownerId) ||
    (ownerEmail != null && currentUser?.email?.toLowerCase() === ownerEmail.toLowerCase());

  const currentMemberRecord = members.find(
    (m) =>
      (currentUser?.id != null && m.userId === currentUser.id) ||
      (currentUser?.email != null && m.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const isGroupAdmin = currentMemberRecord?.role === "GROUP_ADMIN";
  const canManageMembers = isOwner || isGroupAdmin;

  // Invite member submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setSuccessMsg("");

    const emailToSubmit = inviteEmail.trim();
    if (!emailToSubmit) {
      setInviteError("Email address cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSubmit)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    setIsInviting(true);
    try {
      await addTripMember(tripId, emailToSubmit);
      setSuccessMsg(`Member "${emailToSubmit}" added successfully.`);
      setInviteEmail("");
      setInviteModalOpen(false);
      await fetchMembers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404") || message.toLowerCase().includes("not found")) {
        setInviteError("No user was found with this email address.");
      } else if (message.includes("409") || message.toLowerCase().includes("already a member")) {
        setInviteError("This user is already a member of this trip.");
      } else if (message.includes("403") || message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("unauthorized")) {
        setInviteError("You do not have permission to invite members.");
      } else {
        setInviteError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsInviting(false);
    }
  };

  // Change member role
  const handleRoleChange = async (member: TripMemberResponse, newRole: MembershipRole) => {
    if (member.role === newRole) return;
    setUpdatingRoleId(member.userId);
    setError("");
    setSuccessMsg("");
    try {
      await changeTripMemberRole(tripId, member.userId, newRole);
      setSuccessMsg(`Updated ${member.name}'s role to ${newRole === "GROUP_ADMIN" ? "Group Admin" : "Member"}.`);
      await fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change member role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Remove member execution
  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setIsRemoving(true);
    setError("");
    setSuccessMsg("");
    try {
      await removeTripMember(tripId, removeTarget.userId);
      setSuccessMsg(`Removed ${removeTarget.name} from the trip.`);
      setRemoveTarget(null);
      await fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove member.");
      setRemoveTarget(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-slate-900">
            <span>👥</span> Trip Members
          </h2>
          <p className="mt-1 text-sm text-slate-500">People participating in this journey</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMembers}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>

          {canManageMembers && (
            <button
              onClick={() => {
                setInviteError("");
                setInviteEmail("");
                setInviteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
            >
              <span>+</span> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Alert Notifications */}
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

      {/* Member List Grid */}
      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          Loading trip members…
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">No members found for this trip.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const memberIsOwner = ownerId != null && member.userId === ownerId;
            const displayRole = member.role === "GROUP_ADMIN" ? "Group Admin" : "Member";

            return (
              <div
                key={member.id || member.userId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-extrabold text-white shadow-md shadow-indigo-100">
                    {member.name
                      ? member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-extrabold text-slate-900">{member.name}</p>
                      {memberIsOwner && (
                        <span className="shrink-0 rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-800">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          member.role === "GROUP_ADMIN"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-indigo-200 bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {displayRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Action Bar (Owner/Group Admin Only) */}
                {canManageMembers && !memberIsOwner && (
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3">
                    <select
                      disabled={updatingRoleId === member.userId}
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value as MembershipRole)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="GROUP_ADMIN">Group Admin</option>
                    </select>

                    <button
                      onClick={() => setRemoveTarget(member)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Invite New Member</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-lg font-bold text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              {inviteError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isInviting}
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isInviting ? "Inviting…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Remove Member?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{removeTarget.name}</span> (
              {removeTarget.email}) from this trip?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isRemoving}
                onClick={() => setRemoveTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isRemoving}
                onClick={handleRemoveConfirm}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isRemoving ? "Removing…" : "Confirm Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
