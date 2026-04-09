"use client";

import Link from "next/link";
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineGlobe,
  HiOutlineHeart,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { type ReactNode } from "react";

/* ============================================
   Icon arrays (static)
   ============================================ */
const pillarIcons: ReactNode[] = [
  <HiOutlineLightBulb key="p1" size={28} />,
  <HiOutlineUserGroup key="p2" size={28} />,
  <HiOutlineShieldCheck key="p3" size={28} />,
  <HiOutlineHeart key="p4" size={28} />,
];

const audienceIcons: ReactNode[] = [
  <HiOutlineAcademicCap key="a1" size={32} />,
  <HiOutlineBriefcase key="a2" size={32} />,
  <HiOutlineGlobe key="a3" size={32} />,
];

/* ============================================
   Component
   ============================================ */
export default function AboutPage() {
  const { t } = useLanguage();

  const pillars = [1, 2, 3, 4].map((n, i) => ({
    icon: pillarIcons[i],
    title: t(`about.pillar.${n}.title`),
    description: t(`about.pillar.${n}.desc`),
  }));

  const milestones = [1, 2, 3].map((n) => ({
    year: t(`about.milestone.${n}.year`),
    title: t(`about.milestone.${n}.title`),
    description: t(`about.milestone.${n}.desc`),
  }));

  const audienceKeys = ["students", "companies", "universities"] as const;
  const audiences = audienceKeys.map((key, i) => ({
    icon: audienceIcons[i],
    title: t(`about.serve.${key}.title`),
    description: t(`about.serve.${key}.desc`),
  }));

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-surface-cream">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-coffee-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center lg:py-36">

          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-coffee-dark sm:text-5xl lg:text-6xl">
            {t("about.hero.title")}
            <span className="text-coffee-gold">{t("about.hero.titleAccent")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {t("about.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ======== MISSION ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("about.mission.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("about.mission.subtitle")}
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group rounded-card border border-surface-sand bg-surface-cream p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-coffee-gold/15 text-coffee-warm transition-colors group-hover:bg-coffee-gold/30">
                  {pillar.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-coffee-dark">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== OUR STORY / TIMELINE ======== */}
      <section className="bg-surface-cream py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("about.story.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("about.story.subtitle")}
          </p>

          <div className="relative border-l-2 border-coffee-gold/30 pl-8">
            {milestones.map((milestone, idx) => (
              <div
                key={milestone.year}
                className={`relative ${idx !== milestones.length - 1 ? "mb-12" : ""}`}
              >
                {/* Dot */}
                <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-coffee-gold bg-surface-cream">
                  <div className="h-2 w-2 rounded-full bg-coffee-gold" />
                </div>

                <span className="mb-1 inline-block rounded-full bg-coffee-gold/15 px-3 py-0.5 text-xs font-semibold tracking-wide text-coffee-warm">
                  {milestone.year}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-coffee-dark">
                  {milestone.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== WHO WE SERVE ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("about.serve.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("about.serve.subtitle")}
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="group rounded-card border border-surface-sand bg-surface-cream p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-coffee-gold/15 text-coffee-warm transition-colors group-hover:bg-coffee-gold/30">
                  {audience.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-coffee-dark">
                  {audience.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="bg-coffee-dark dark-section py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-text-inverse! sm:text-4xl">
            {t("aboutCta.title")}
            <span className="text-coffee-gold">{t("aboutCta.titleAccent")}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-inverse/90">
            {t("aboutCta.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-gold px-8 py-3.5 text-sm font-semibold text-coffee-dark shadow-lg transition-all hover:bg-coffee-warm hover:text-coffee-dark"
            >
              {t("aboutCta.primary")}
            </Link>
            <Link
              href="/contact"
              className="rounded-button border-2 border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-coffee-gold hover:text-coffee-gold"
            >
              {t("aboutCta.secondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
