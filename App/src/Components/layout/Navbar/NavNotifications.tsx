"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineClipboardCheck,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineStar,
} from "react-icons/hi";
import { useNotifications } from "@/Components/contexts/NotificationContext";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NavNotifications() {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={notifRef} className="relative">
      <button
        onClick={() => setNotifOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
        aria-label="Notifications"
      >
        <HiOutlineBell size={20} className={unreadCount > 0 ? "animate-[swing_1s_ease-in-out]" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-surface-sand bg-surface-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-sand bg-surface-cream px-5 py-4">
            <div className="flex items-center gap-2">
              <HiOutlineBell size={18} className="text-coffee-warm" />
              <h3 className="text-sm font-semibold text-coffee-dark">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coffee-warm/15 px-1.5 text-[11px] font-semibold text-coffee-warm">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 rounded-full border border-surface-sand bg-surface-white px-3 py-1 text-[11px] font-medium text-text-secondary transition-all hover:bg-coffee-gold/10 hover:text-coffee-dark cursor-pointer"
              >
                <HiOutlineCheckCircle size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-surface-sand/40">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-cream">
                  <HiOutlineBell size={28} className="text-text-muted/40" />
                </div>
                <p className="text-sm text-text-muted">No notifications yet</p>
                <p className="text-xs text-text-muted/60">We&apos;ll notify you when something happens</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const Icon = n.type === "new_application" ? HiOutlineBriefcase
                  : n.type === "application_status_changed" ? HiOutlineClipboardCheck
                  : n.type === "agreement_needs_validation" ? HiOutlineAcademicCap
                  : n.type === "new_review" ? HiOutlineStar
                  : HiOutlineShieldCheck;

                const iconBg = n.type === "new_application" ? "bg-status-info/10 text-status-info"
                  : n.type === "application_status_changed" ? "bg-status-success/10 text-status-success"
                  : n.type === "agreement_needs_validation" ? "bg-status-warning/10 text-status-warning"
                  : n.type === "new_review" ? "bg-amber-500/10 text-amber-500"
                  : "bg-coffee-warm/10 text-coffee-warm";

                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      setNotifOpen(false);
                    }}
                    className={`group flex w-full items-start gap-3 px-5 py-4 text-left transition-all hover:bg-surface-cream cursor-pointer ${
                      !n.isRead ? "bg-coffee-gold/[0.06]" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-105`}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] leading-snug ${!n.isRead ? "font-semibold text-coffee-dark" : "font-medium text-text-secondary"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coffee-warm" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted line-clamp-2">{n.message}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-text-muted/60">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
