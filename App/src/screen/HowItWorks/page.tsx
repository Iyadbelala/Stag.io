"use client";

import Link from "next/link";
import {
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineGlobe,
} from "react-icons/hi";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { type ReactNode } from "react";

const stepIcons: ReactNode[] = [
  <HiOutlineUserAdd key="st1" size={28} />,
  <HiOutlineSearch key="st2" size={28} />,
  <HiOutlineChartBar key="st3" size={28} />,
];

const roleIcons: ReactNode[] = [
  <HiOutlineAcademicCap key="r1" size={32} />,
  <HiOutlineBriefcase key="r2" size={32} />,
  <HiOutlineGlobe key="r3" size={32} />,
];

const stepNumbers = ["01", "02", "03"];
const roleKeys = ["students", "companies", "universities"] as const;

export default function HowItWorksPage() {
  const { t } = useLanguage();

  const steps = [1, 2, 3].map((n, i) => ({
    number: stepNumbers[i],
    icon: stepIcons[i],
    title: t(`hiw.step.${n}.title`),
    description: t(`hiw.step.${n}.desc`),
  }));

  const roles = roleKeys.map((key, i) => ({
    icon: roleIcons[i],
    title: t(`hiw.role.${key}.title`),
    points: [1, 2, 3, 4].map((n) => t(`hiw.role.${key}.${n}`)),
  }));

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-surface-cream">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-coffee-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center lg:py-36">
          <h1 className="max-w-3xl text-4xl font-heading font-bold leading-tight text-coffee-dark sm:text-5xl lg:text-6xl">
            {t("hiw.hero.title1")}
            <span className="text-coffee-gold">{t("hiw.hero.titleAccent")}</span>
            {t("hiw.hero.title2")}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {t("hiw.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ======== STEPS ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("hiw.steps.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("hiw.steps.subtitle")}
          </p>

          <div className="flex flex-col gap-12 lg:gap-16">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  idx % 2 !== 0 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex shrink-0 flex-col items-center">
                  <span className="font-heading text-5xl font-bold text-coffee-gold/30">
                    {step.number}
                  </span>
                  <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-coffee-gold/15 text-coffee-warm">
                    {step.icon}
                  </div>
                </div>

                <div className={`max-w-lg ${idx % 2 !== 0 ? "lg:text-right" : ""}`}>
                  <h3 className="mb-2 font-heading text-xl font-semibold text-coffee-dark">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== ROLE GUIDES ======== */}
      <section className="bg-surface-cream py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            {t("hiw.roles.title")}
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            {t("hiw.roles.subtitle")}
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="group rounded-card border border-surface-sand bg-surface-white p-8 transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-coffee-gold/15 text-coffee-warm transition-colors group-hover:bg-coffee-gold/30">
                  {role.icon}
                </div>
                <h3 className="mb-4 text-center font-heading text-lg font-semibold text-coffee-dark">
                  {role.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coffee-gold" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="bg-coffee-dark dark-section py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-text-inverse! sm:text-4xl">
            {t("hiwCta.title")}
            <span className="text-coffee-gold">{t("hiwCta.titleAccent")}</span>?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-inverse/90">
            {t("hiwCta.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-gold px-8 py-3.5 text-sm font-semibold text-coffee-dark shadow-lg transition-all hover:bg-coffee-warm hover:text-coffee-dark"
            >
              {t("hiwCta.primary")}
            </Link>
            <Link
              href="/about"
              className="rounded-button border-2 border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-coffee-gold hover:text-coffee-gold"
            >
              {t("hiwCta.secondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
