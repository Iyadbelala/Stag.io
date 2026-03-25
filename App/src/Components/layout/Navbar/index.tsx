"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineMenuAlt3,
  HiX,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineTranslate,
} from "react-icons/hi";
import { useTheme } from "@/Components/contexts/ThemeContext";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { useAuth } from "@/Components/contexts/AuthContext";
import Logo from "@/Components/ui/Logo";
import NavNotifications from "./NavNotifications";
import NavUserMenu from "./NavUserMenu";
import NavMobileMenu from "./NavMobileMenu";
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
  const { isDark, toggleTheme, toggleRef } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-sand bg-surface-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ── Logo ── */}
        <Logo />

        {/* ── Desktop Links ── */}
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

        {/* ── Desktop CTA ── */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Switcher */}
          <div className="relative">
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

          {/* Notifications */}
          {user && <NavNotifications />}

          {user ? (
            <NavUserMenu />
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

        {/* ── Mobile Toggle ── */}
        <div className="flex items-center gap-3 md:hidden">
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

      {/* ── Mobile Menu ── */}
      <NavMobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
      />
    </nav>
  );
}
