"use client";

import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Logo from "@/Components/Logo";
import { useLanguage } from "@/Components/LanguageContext";
import { type ReactNode } from "react";

/* ============================================
   AuthBrandPanel — left sidebar on the auth page
   Displays brand, hero copy, feature pills, and copyright.
   Visible on lg+ screens only.
   ============================================ */

const featureIcons: ReactNode[] = [
  <HiOutlineBriefcase key="bf1" size={20} />,
  <HiOutlineClipboardList key="bf2" size={20} />,
  <HiOutlineShieldCheck key="bf3" size={20} />,
];

const featureKeys = ["brand.feature.1", "brand.feature.2", "brand.feature.3"];

export default function AuthBrandPanel() {
  const { t } = useLanguage();

  return (
    <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-coffee-dark dark-section p-12 lg:flex xl:w-[42%]">
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-coffee-dark/40 via-transparent to-coffee-gold/10" />

      {/* Subtle animated background blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-coffee-gold/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

      {/* Top — Logo */}
      <div className="relative z-10">
        <Logo size="text-3xl" variant="light" />
      </div>

      {/* Center — Copy */}
      <div className="relative z-10 -mt-8">
        <h2 className="mb-4 font-heading text-4xl font-bold leading-tight text-text-inverse! xl:text-5xl">
          {t("brand.title1")}
          <br />
          {t("brand.title2")}<span className="text-coffee-gold">{t("brand.titleAccent")}</span>
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-text-inverse/70">
          {t("brand.subtitle")}
        </p>

        {/* Feature pills */}
        <div className="mt-10 flex flex-col gap-4">
          {featureKeys.map((key, i) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-button bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coffee-gold/20 text-coffee-gold">
                {featureIcons[i]}
              </span>
              <span className="text-sm text-text-inverse/80">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom — Copyright */}
      <div className="relative z-10">
        <p className="text-xs text-text-inverse/30">
          &copy; {new Date().getFullYear()} {t("brand.copyright")}
        </p>
      </div>
    </div>
  );
}
