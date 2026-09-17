"use client";

import { useEffect, useState } from "react";
import AppShell from "../../../components/AppShell";
import {
  getPaginatedAdminUsers,
  getAdminUserStats,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
  getAdminUserDetails,
} from "../../../lib/api";
import type { UserAdminDTO, UserStatsResponse, UserDetailsDTO } from "../../../lib/types";
import { Users, Search, Shield, Trash2, CheckCircle, XCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, UserCheck, UserX, AlertTriangle, X } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Selected User for Details Modal
  const [selectedUser, setSelectedUser] = useState<UserDetailsDTO | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Selected User for Delete Modal
  const [userToDelete, setUserToDelete] = useState<UserAdminDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStats = async () => {
    try {
      const data = await getAdminUserStats();
      setStats(data);
    } catch {
      // Ignore stats error gracefully
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaginatedAdminUsers({
        page,
        size: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateAdminUserRole(userId, newRole);
      setActionSuccess(`User role updated to ${newRole} successfully.`);
      loadUsers();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update user role.");
    }
  };

  const handleStatusToggle = async (user: UserAdminDTO) => {
    const nextStatus = !user.active;
    try {
      await updateAdminUserStatus(user.id, nextStatus);
      setActionSuccess(`User status updated to ${nextStatus ? "Active" : "Inactive"}.`);
      loadUsers();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update user status.");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteAdminUser(userToDelete.id);
      setActionSuccess(String(res.message || "User account updated successfully."));
      setUserToDelete(null);
      loadUsers();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = async (userId: number) => {
    setLoadingDetails(true);
    setSelectedUser(null);
    try {
      const details = await getAdminUserDetails(userId);
      setSelectedUser(details);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load user details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md border border-white/10">
              <Users className="h-3.5 w-3.5 text-indigo-300" />
              User Control Center
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Platform User Management
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-300 leading-relaxed">
              Manage accounts, assign administrator roles, review trip activity, and toggle active user statuses.
            </p>
          </div>

          <button
            onClick={() => {
              loadUsers();
              loadStats();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Accounts
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.totalUsers ?? totalElements}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Travelers</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats?.activeUsers ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inactive Accounts</span>
          <p className="mt-1 text-2xl font-black text-rose-600">{stats?.deactivatedUsers ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrators</span>
          <p className="mt-1 text-2xl font-black text-purple-600">{stats?.adminCount ?? 0}</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✅ {actionSuccess}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="TRAVELER">Traveler</option>
            <option value="GROUP_ADMIN">Group Admin</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Auth Type</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">Loading user accounts…</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-slate-500">
                    No user accounts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-extrabold text-white text-sm shadow-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role || "TRAVELER"}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="TRAVELER">Traveler</option>
                        <option value="GROUP_ADMIN">Group Admin</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          user.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {user.active ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3.5 w-3.5 text-rose-600" /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {user.oauthGoogle ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                          Google OAuth
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                          Email / Password
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <span className="text-xs font-medium text-slate-500">
            Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total users)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">User Account Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 font-black text-white text-xl">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Account ID</span>
                  <p className="font-bold text-slate-900">#{selectedUser.id}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Status</span>
                  <p className={`font-bold ${selectedUser.active ? "text-emerald-600" : "text-rose-600"}`}>
                    {selectedUser.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Total Trips</span>
                  <p className="font-bold text-slate-900">{selectedUser.tripCount ?? 0} Trips</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Planned Budget</span>
                  <p className="font-bold text-slate-900">₹{(selectedUser.totalPlannedBudget || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete User Account?</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Are you sure you want to remove <strong>{userToDelete.name}</strong> ({userToDelete.email})? If user owns trips, account will be safely deactivated.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 justify-end">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Processing…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
