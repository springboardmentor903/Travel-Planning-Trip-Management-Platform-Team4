"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  DollarSign,
  MapPin,
  Inbox,
  X,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../lib/api";
import type { Notification, NotificationType } from "../lib/types";

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unified refresh function for unread count & full notification list
  const refreshData = async (showLoading = false) => {
    // 1. Verify authentication
    if (typeof window === "undefined" || !localStorage.getItem("token")) {
      return;
    }
    // 2. Pause requests when tab is hidden (Page Visibility API)
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    try {
      if (showLoading) setLoading(true);
      const [countData, listData] = await Promise.all([
        getUnreadNotificationCount().catch(() => null),
        getNotifications().catch(() => null),
      ]);

      if (listData) {
        setNotifications(listData);
      }
      if (countData) {
        setUnreadCount(countData.count ?? countData.unreadCount ?? 0);
      } else if (listData) {
        setUnreadCount(listData.filter((n) => !isNotificationRead(n)).length);
      }
    } catch (err) {
      console.error("Periodic notification refresh error:", err);
      // Retain existing state gracefully if polling fails
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Periodic polling hook (30s interval) with Page Visibility API & Strict Mode cleanup
  useEffect(() => {
    refreshData(false);

    const intervalId = setInterval(() => {
      refreshData(false);
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshData(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (open) {
      refreshData(false);
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track notification IDs currently being processed to prevent duplicate simultaneous clicks
  const [pendingReads, setPendingReads] = useState<Set<number>>(new Set());

  const isNotificationRead = (n: Notification) => n.isRead ?? n.read ?? false;

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const target = notifications.find((n) => n.id === id);
    // Avoid redundant API requests for already read notifications or in-flight requests
    if (!target || isNotificationRead(target) || pendingReads.has(id)) {
      return;
    }

    // 1. Add to pending reads set to lock duplicate clicks
    setPendingReads((prev) => new Set(prev).add(id));

    // 2. Optimistically update local state & unread count
    const originalIsRead = target.isRead;
    const originalRead = target.read;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      // 3. Execute backend API request
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read`, err);

      // 4. Rollback to original state on API failure
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: originalIsRead, read: originalRead } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    } finally {
      // 5. Unlock pending state
      setPendingReads((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read", err);
      // Rollback on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !isNotificationRead(target)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!isNotificationRead(n) && !pendingReads.has(n.id)) {
      // Fire optimistic mark as read asynchronously without blocking navigation
      handleMarkAsRead(n.id);
    }
    setOpen(false);
    if (n.relatedTripId) {
      router.push(`/trips/${n.relatedTripId}`);
    }
  };

  const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
      case "JOIN_REQUEST":
      case "JOIN_REQUEST_CREATED":
        return <UserPlus className="h-4 w-4 text-indigo-600" />;
      case "JOIN_REQUEST_APPROVED":
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case "JOIN_REQUEST_REJECTED":
        return <UserX className="h-4 w-4 text-rose-600" />;
      case "MEMBER_ADDED":
        return <UserCheck className="h-4 w-4 text-indigo-600" />;
      case "EXPENSE_ADDED":
        return <DollarSign className="h-4 w-4 text-amber-600" />;
      case "TRIP_UPDATED":
      default:
        return <MapPin className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-2xs hover:bg-[#FAFAF9] hover:border-[#D1D5DB] transition focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-[#6B7280]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl z-50 overflow-hidden text-[#111827]"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-[#F1F1EF] px-4 py-3.5 bg-[#FAFAF9]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#4338CA] hover:bg-indigo-50 transition"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-[#9CA3AF] hover:bg-[#F1F1EF] hover:text-[#111827] transition"
                  aria-label="Close notifications panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List Body */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F1F1EF]">
              {loading ? (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                /* Empty State */
                <div className="py-12 text-center px-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-[#111827]">No notifications yet</p>
                  <p className="text-xs text-[#6B7280] mt-1 max-w-[220px] mx-auto">
                    When you have new trip updates or join requests, they will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const read = isNotificationRead(n);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex items-start gap-3 p-3.5 text-left transition-all cursor-pointer ${
                        !read
                          ? "bg-indigo-50/50 hover:bg-indigo-50/80 border-l-3 border-indigo-600 pl-3"
                          : "bg-white hover:bg-[#FAFAF9]"
                      }`}
                    >
                      {/* Category Icon */}
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs border border-[#E5E7EB]">
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Content Body */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" title="Unread notification" />
                            )}
                            <p
                              className={`truncate text-xs ${
                                !read ? "font-bold text-[#111827]" : "font-normal text-[#4B5563]"
                              }`}
                            >
                              {n.title || "Notification"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-medium text-[#9CA3AF]">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                            !read ? "text-[#1F2937] font-medium" : "text-[#6B7280]"
                          }`}
                        >
                          {n.message}
                        </p>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!read && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            title="Mark as read"
                            className="rounded p-1 text-[#9CA3AF] hover:text-indigo-600 hover:bg-white transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          title="Delete notification"
                          className="opacity-0 group-hover:opacity-100 rounded p-1 text-[#9CA3AF] hover:text-rose-600 hover:bg-white transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
