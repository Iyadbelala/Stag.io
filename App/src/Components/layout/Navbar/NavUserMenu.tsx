"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineViewGrid,
  HiOutlineLogout,
  HiOutlineBookmark,
  HiOutlineStar,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useLanguage } from "@/Components/contexts/LanguageContext";

function getDashboardHref(role: string) {
  if (role === "company") return "/company";
  if (role === "admin") return "/admin";
  if (role === "superadmin") return "/superadmin";
  if (role === "university") return "/university";
  return "/student";
}

function getDisplayName(user: { role: string; companyName?: string; universityName?: string; firstName?: string; lastName?: string; email: string }) {
  if (user.role === "company") return user.companyName;
  if (user.role === "university") return user.universityName;
  return `${user.firstName} ${user.lastName}`;
}

export default function NavUserMenu() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/login");
  };

  if (!user) return null;

  return (
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
              {getDisplayName(user)}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <Link
            href={getDashboardHref(user.role)}
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
  );
}
