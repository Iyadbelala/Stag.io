"use client";

import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Slide from "@/Components/ui/Slide";
import type { SlideData } from "@/Components/ui/Slide";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { type ReactNode } from "react";

/* ============================================
   Icon arrays (static — no translation needed)
   ============================================ */
const slideIcons: ReactNode[] = [
  <HiOutlineBriefcase key="s1" size={30} />,
  <HiOutlineClipboardList key="s2" size={30} />,
  <HiOutlineAcademicCap key="s3" size={30} />,
  <HiOutlineLightBulb key="s4" size={30} />,
];

const featureIcons: ReactNode[] = [
  <HiOutlineBriefcase key="f1" size={28} />,
  <HiOutlineClipboardList key="f2" size={28} />,
  <HiOutlineUserGroup key="f3" size={28} />,
  <HiOutlineShieldCheck key="f4" size={28} />,
];

const statValues = ["2,500+", "800+", "15,000+", "50+"];
const statKeys = [
  "stats.internshipsPosted",
  "stats.partnerCompanies",
  "stats.studentsConnected",
  "stats.universities",
];

/* ============================================
   Component
   ============================================ */
export default function Homepage() {
  const { t } = useLanguage();

  const slides: SlideData[] = [1, 2, 3, 4].map((n, i) => ({
    title: t(`slides.${n}.title`),
    icon: slideIcons[i],
  }));

  const features = [1, 2, 3, 4].map((n, i) => ({
    icon: featureIcons[i],
    title: t(`features.${n}.title`),
    description: t(`features.${n}.desc`),
  }));

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-surface-cream">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-coffee-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center lg:py-36">

          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-coffee-dark sm:text-5xl lg:text-6xl">
            {t("hero.title")}
            <span className="text-coffee-gold">{t("hero.titleAccent")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-warm px-7 py-3.5 text-sm font-medium text-text-inverse shadow-md transition-all hover:bg-coffee-gold hover:shadow-lg"
            >
              {t("hero.getStarted")}
            </Link>
            <Link
              href="/about"
              className="rounded-button border-2 border-coffee-warm px-7 py-3.5 text-sm font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
            >
              {t("hero.learnMore")}
            </Link>
          </div>
        </div>
      </section>

      {/* ======== STATS BAR ======== */}
      <section className="border-y border-surface-sand bg-surface-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {statKeys.map((key, i) => (
            <div key={key} className="text-center">
              <p className="text-3xl font-bold text-coffee-dark">
                {statValues[i]}
              </p>
              <p className="mt-1 text-xs tracking-wide text-text-muted">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== HOW IT WORKS — SLIDES ======== */}
      <section className="bg-surface-cream py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("slides.title")}
          </h2>
          <p className="mb-12 text-center text-sm text-text-muted">
            {t("slides.subtitle")}
          </p>
          <Slide slides={slides} autoPlayMs={6000} />
        </div>
      </section>

      {/* ======== FEATURES GRID ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("features.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("features.subtitle")}
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-card border border-surface-sand bg-surface-cream p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-coffee-gold/15 text-coffee-warm transition-colors group-hover:bg-coffee-gold/30">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-coffee-dark">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRUSTED BY ======== */}
      <section className="bg-surface-cream py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-2 font-heading text-3xl font-semibold text-coffee-dark">
            {t("trustedBy.title")}
          </h2>
          <p className="mb-12 text-sm text-text-muted">
            {t("trustedBy.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3 opacity-80 transition-opacity hover:opacity-100">
              <div className="relative h-20 w-20">
                <Image
                  src="/UC2-logo.png"
                  alt="University Constantine 2"
                  fill
                  className="object-contain"
                  style={{
                    filter:
                      "grayscale(100%) sepia(60%) saturate(200%) hue-rotate(-15deg) brightness(0.55)",
                  }}
                />
              </div>
              <span className="text-xs font-medium tracking-wide text-text-muted">
                {t("trustedBy.uc2")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="bg-coffee-dark dark-section py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-text-inverse! sm:text-4xl">
            {t("homeCta.title")}
            <span className="text-coffee-gold">{t("homeCta.titleAccent")}</span>?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-inverse/90">
            {t("homeCta.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-gold px-8 py-3.5 text-sm font-semibold text-coffee-dark shadow-lg transition-all hover:bg-coffee-warm hover:text-coffee-dark"
            >
              {t("homeCta.primary")}
            </Link>
            <Link
              href="/contact"
              className="rounded-button border-2 border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-coffee-gold hover:text-coffee-gold"
            >
              {t("homeCta.secondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
