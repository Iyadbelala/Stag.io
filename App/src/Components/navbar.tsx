"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineMenuAlt3,
  HiX,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineTranslate,
  HiOutlineUser,
  HiOutlineViewGrid,
  HiOutlineLogout,
  HiOutlineBookmark,
  HiOutlineBell,
  HiOutlineBriefcase,
  HiOutlineClipboardCheck,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineStar,
} from "react-icons/hi";
import { useTheme } from "@/Components/ThemeContext";
import { useLanguage } from "@/Components/LanguageContext";
import Logo from "@/Components/Logo";
import { useAuth } from "@/Components/AuthContext";
import { useNotifications } from "@/Components/NotificationContext";
import type { Lang } from "@/i18n";

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

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.internships", href: "/internships" },
  { labelKey: "nav.companies", href: "/companies" },
  { labelKey: "nav.about", href: "/about" },
];

const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme, toggleRef } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-sand bg-surface-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ---- Logo ---- */}
        <Logo />

        {/* ---- Desktop Links ---- */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks
            .filter((link) => !(user && link.href === "/"))
            .map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative font-body text-sm font-medium text-text-secondary transition-colors hover:text-coffee-dark
                  after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-coffee-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        {/* ---- Desktop CTA ---- */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Switcher */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-surface-sand px-3 text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
              aria-label="Change language"
            >
              <HiOutlineTranslate size={18} />
              <span className="text-xs font-medium uppercase">{lang}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-card border border-surface-sand bg-surface-white shadow-lg">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      lang === l.code
                        ? "bg-coffee-gold/10 font-medium text-coffee-dark"
                        : "text-text-secondary hover:bg-surface-cream"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            ref={toggleRef}
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <HiOutlineSun
              size={18}
              className={`absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
            />
            <HiOutlineMoon
              size={18}
              className={`absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
            />
          </button>

          {/* Notification Bell */}
          {user && (
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
                            {/* Icon */}
                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-105`}>
                              <Icon size={20} />
                            </div>

                            {/* Content */}
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
          )}

          {user ? (
            /* ---- User Dropdown ---- */
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
                aria-label="User menu"
              >
                <HiOutlineUser size={20} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-card border border-surface-sand bg-surface-white shadow-lg">
                  {/* User info header */}
                  <div className="border-b border-surface-sand px-4 py-3">
                    <p className="text-sm font-medium text-coffee-dark truncate">
                      {user.role === "company" ? user.companyName : user.role === "university" ? user.universityName : `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <Link
                    href={user.role === "company" ? "/company" : user.role === "admin" ? "/admin" : user.role === "superadmin" ? "/superadmin" : user.role === "university" ? "/university" : "/student"}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                  >
                    <HiOutlineViewGrid size={16} />
                    Dashboard
                  </Link>
                  {user.role !== "admin" && user.role !== "superadmin" && user.role !== "university" && (
                    <Link
                      href={user.role === "company" ? "/company/profile" : "/student/profile"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                    >
                      <HiOutlineUser size={16} />
                      Profile
                    </Link>
                  )}
                  {user.role === "student" && (
                    <Link
                      href="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                    >
                      <HiOutlineBookmark size={16} />
                      Saved
                    </Link>
                  )}
                  {(user.role === "student" || user.role === "company") && (
                    <Link
                      href="/reviews"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                    >
                      <HiOutlineStar size={16} />
                      Reviews
                    </Link>
                  )}

                  <div className="border-t border-surface-sand">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-status-error transition-colors hover:bg-status-error/5 cursor-pointer"
                    >
                      <HiOutlineLogout size={16} />
                      {t("nav.signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-button border-2 border-coffee-warm px-5 py-2 text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-button bg-coffee-warm px-5 py-2 text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}
        </div>

        {/* ---- Mobile Toggle ---- */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Language Switcher */}
          <button
            onClick={() => {
              const codes = languages.map((l) => l.code);
              const idx = codes.indexOf(lang);
              setLanguage(codes[(idx + 1) % codes.length]);
            }}
            className="flex h-9 items-center gap-1.5 rounded-full border border-surface-sand px-3 text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
            aria-label="Change language"
          >
            <HiOutlineTranslate size={18} />
            <span className="text-xs font-medium uppercase">{lang}</span>
          </button>

          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <HiOutlineSun
              size={18}
              className={`absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
            />
            <HiOutlineMoon
              size={18}
              className={`absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
            />
          </button>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="text-coffee-dark"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX size={26} /> : <HiOutlineMenuAlt3 size={26} />}
          </button>
        </div>
      </div>

      {/* ---- Mobile Menu ---- */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4 border-t border-surface-sand bg-surface-white px-6 py-6">
          {navLinks
            .filter((link) => !(user && link.href === "/"))
            .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-body text-sm font-medium text-text-secondary transition-colors hover:text-coffee-dark"
            >
              {t(link.labelKey)}
            </Link>
          ))}

          <hr className="border-surface-sand" />

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                {/* Mobile user info */}
                <div className="px-1 py-1">
                  <p className="text-sm font-medium text-coffee-dark">
                    {user.role === "company" ? user.companyName : user.role === "university" ? user.universityName : `${user.firstName} ${user.lastName}`}
                  </p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                <Link
                  href={user.role === "company" ? "/company" : user.role === "admin" ? "/admin" : user.role === "superadmin" ? "/superadmin" : user.role === "university" ? "/university" : "/student"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
                >
                  Dashboard
                </Link>
                {(user.role === "student" || user.role === "company") && (
                  <Link
                    href="/reviews"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
                  >
                    Reviews
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-button bg-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-button bg-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
