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
  HiOutlineArrowRight,
} from "react-icons/hi";
import Slide from "@/Components/ui/Slide";
import type { SlideData } from "@/Components/ui/Slide";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { type ReactNode } from "react";
import {
  Reveal,
  Stagger,
  AnimatedCounter,
  TiltCard,
  Magnetic,
} from "@/Components/ui/Motion";

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

const statIcons = [
  <HiOutlineBriefcase key="si1" size={22} className="text-coffee-gold" />,
  <HiOutlineShieldCheck key="si2" size={22} className="text-coffee-gold" />,
  <HiOutlineUserGroup key="si3" size={22} className="text-coffee-gold" />,
  <HiOutlineAcademicCap key="si4" size={22} className="text-coffee-gold" />,
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
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-coffee-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-coffee-warm/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-logo-sage/10 blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #3d2817 1px, transparent 1px), linear-gradient(to bottom, #3d2817 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center lg:py-32">
          {/* Eyebrow pill */}


          <Reveal variant="fade-up" duration={700} delay={100}>
            <h1 className="max-w-4xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-coffee-dark sm:text-5xl lg:text-7xl">
              {t("hero.title")}
              <span className="animate-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-gradient-to-r from-coffee-gold via-coffee-warm to-coffee-gold">
                {t("hero.titleAccent")}
              </span>
            </h1>
          </Reveal>

          <Reveal variant="fade-up" duration={600} delay={250}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {t("hero.subtitle")}
            </p>
          </Reveal>

          <Reveal variant="fade-up" duration={600} delay={400}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Magnetic strength={0.15}>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-button bg-gradient-to-r from-coffee-warm to-coffee-gold px-8 py-4 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/25 transition-all duration-300 hover:shadow-xl hover:shadow-coffee-gold/30 hover:-translate-y-0.5"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{t("hero.getStarted")}</span>
                  <HiOutlineArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href="/about"
                  className="rounded-button border border-coffee-warm/30 bg-surface-white/60 px-8 py-4 text-sm font-medium text-coffee-warm backdrop-blur-sm transition-all duration-300 hover:border-coffee-warm hover:bg-surface-white hover:-translate-y-0.5"
                >
                  {t("hero.learnMore")}
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          {/* Trust indicators */}
          <Reveal variant="fade-up" duration={600} delay={550}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <HiOutlineShieldCheck size={16} className="text-logo-sage" />
                <span>Secure &amp; verified</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-text-muted/40" />
              <div className="flex items-center gap-2">
                <HiOutlineAcademicCap size={16} className="text-coffee-gold" />
                <span>Partnered with top universities</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-text-muted/40" />
              <div className="flex items-center gap-2">
                <HiOutlineUserGroup size={16} className="text-coffee-warm" />
                <span>Trusted by 15k+ students</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======== STATS BAR ======== */}
      <section className="relative bg-surface-cream">
        <div className="relative mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-3xl border border-surface-sand/70 bg-surface-white shadow-lg shadow-coffee-warm/5 px-6 py-10 sm:px-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4 sm:divide-x sm:divide-surface-sand/70">
              {statKeys.map((key, i) => (
                <Reveal key={key} variant="fade-up" delay={i * 100} duration={500}>
                  <div className="group text-center sm:px-4">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-gold/15 to-coffee-warm/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {statIcons[i]}
                    </div>
                    <p className="font-heading text-3xl font-bold text-coffee-dark lg:text-4xl">
                      <AnimatedCounter target={statValues[i]} duration={2000} />
                    </p>
                    <p className="mt-1.5 text-xs tracking-wide text-text-muted">
                      {t(key)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS — SLIDES ======== */}
      <section className="bg-surface-cream py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal variant="fade-up">
            <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark sm:text-4xl">
              {t("slides.title")}
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={100}>
            <p className="mb-12 text-center text-sm text-text-muted">
              {t("slides.subtitle")}
            </p>
          </Reveal>
          <Reveal variant="zoom" delay={200}>
            <Slide slides={slides} autoPlayMs={6000} />
          </Reveal>
        </div>
      </section>

      {/* ======== FEATURES GRID ======== */}
      <section className="relative bg-surface-white py-24 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-coffee-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-coffee-warm/5 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal variant="fade-up">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-coffee-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-coffee-warm">
              <span className="h-1.5 w-1.5 rounded-full bg-coffee-gold" />
              Why Stag.io
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={80}>
            <h2 className="mb-3 text-center font-heading text-3xl font-semibold tracking-tight text-coffee-dark sm:text-4xl lg:text-5xl">
              {t("features.title")}
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={150}>
            <p className="mx-auto mb-16 max-w-lg text-center text-sm leading-relaxed text-text-muted sm:text-base">
              {t("features.subtitle")}
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} variant="fade-up" delay={i * 120}>
                <TiltCard className="h-full">
                  <div className="group relative h-full rounded-3xl border border-surface-sand/70 bg-gradient-to-br from-surface-white to-surface-cream/60 p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-coffee-warm/10 hover:border-coffee-gold/40 hover:-translate-y-1 overflow-hidden">
                    {/* Number badge */}
                    <span className="absolute top-5 right-5 font-heading text-5xl font-bold text-coffee-gold/10 transition-colors duration-500 group-hover:text-coffee-gold/25">
                      0{i + 1}
                    </span>

                    {/* Hover gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-coffee-gold/0 to-coffee-warm/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-coffee-gold/5 group-hover:to-coffee-warm/5" />

                    <div className="relative">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-gold/20 to-coffee-warm/10 text-coffee-warm shadow-sm shadow-coffee-warm/10 transition-all duration-500 group-hover:shadow-md group-hover:shadow-coffee-warm/20 group-hover:scale-110 group-hover:rotate-6">
                        {f.icon}
                      </div>
                      <h3 className="mb-2.5 text-base font-semibold text-coffee-dark">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {f.description}
                      </p>

                      {/* Bottom accent line */}
                      <div className="mt-5 h-0.5 w-10 rounded-full bg-gradient-to-r from-coffee-warm to-coffee-gold transition-all duration-500 group-hover:w-20" />
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRUSTED BY ======== */}
      <section className="bg-surface-cream py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal variant="fade-up">
            <h2 className="mb-2 font-heading text-3xl font-semibold text-coffee-dark sm:text-4xl">
              {t("trustedBy.title")}
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={100}>
            <p className="mb-12 text-sm text-text-muted">
              {t("trustedBy.subtitle")}
            </p>
          </Reveal>

          <Reveal variant="zoom" delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-12">
              <div className="group flex flex-col items-center gap-3 opacity-80 transition-all duration-500 hover:opacity-100 hover:-translate-y-1">
                <div className="relative h-24 w-24 transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src="/UC2-logo.png"
                    alt="University Constantine 2"
                    fill
                    className="object-contain transition-all duration-500 group-hover:drop-shadow-lg"
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
          </Reveal>
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="relative bg-coffee-dark dark-section py-24 overflow-hidden">

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal variant="fade-up">
            <h2 className="font-heading text-3xl font-semibold text-text-inverse! sm:text-4xl lg:text-5xl">
              {t("homeCta.title")}
              <span className="animate-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-gradient-to-r from-coffee-gold via-amber-300 to-coffee-gold">
                {t("homeCta.titleAccent")}
              </span>?
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={150}>
            <p className="mt-4 text-sm leading-relaxed text-text-inverse/90 sm:text-base">
              {t("homeCta.subtitle")}
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={300}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Magnetic strength={0.15}>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 rounded-button bg-coffee-gold px-8 py-4 text-sm font-semibold text-coffee-dark shadow-lg shadow-coffee-gold/25 transition-all duration-300 hover:bg-amber-400 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {t("homeCta.primary")}
                  <HiOutlineArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href="/contact"
                  className="rounded-button border-2 border-white/30 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:border-coffee-gold hover:text-coffee-gold hover:-translate-y-0.5"
                >
                  {t("homeCta.secondary")}
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
