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
} from "react-icons/hi";
import { useTheme } from "@/Components/ThemeContext";
import { useLanguage } from "@/Components/LanguageContext";
import Logo from "@/Components/Logo";
import { useAuth } from "@/Components/AuthContext";
import type { Lang } from "@/i18n";

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
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme, toggleRef } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
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
          {navLinks.map((link) => (
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
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <Link
                    href="/student"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                  >
                    <HiOutlineViewGrid size={16} />
                    Dashboard
                  </Link>
                  <Link
                    href="/student/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
                  >
                    <HiOutlineUser size={16} />
                    Profile
                  </Link>

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
          {navLinks.map((link) => (
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
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                <Link
                  href="/student"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
                >
                  Dashboard
                </Link>
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
