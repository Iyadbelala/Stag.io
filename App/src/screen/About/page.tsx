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
  HiOutlineSparkles,
} from "react-icons/hi";

/* ============================================
   Mission Pillars
   ============================================ */
const pillars = [
  {
    icon: <HiOutlineLightBulb size={28} />,
    title: "Innovation",
    description:
      "We leverage modern technology to simplify every step of the internship lifecycle — from discovery to completion.",
  },
  {
    icon: <HiOutlineUserGroup size={28} />,
    title: "Collaboration",
    description:
      "We bridge the gap between students, companies, and universities, creating a connected ecosystem that benefits everyone.",
  },
  {
    icon: <HiOutlineShieldCheck size={28} />,
    title: "Trust & Transparency",
    description:
      "Every partner is verified and every process is transparent, so all stakeholders can engage with confidence.",
  },
  {
    icon: <HiOutlineHeart size={28} />,
    title: "Student-First",
    description:
      "Students are at the heart of everything we build. Their growth and success drive every product decision we make.",
  },
];

/* ============================================
   Timeline Milestones
   ============================================ */
const milestones = [
  {
    year: "Jan 2026",
    title: "The Idea Takes Shape",
    description:
      "A group of students and educators at Université Constantine 2 identified the need for a unified internship platform.",
  },
  {
    year: "Feb 2026",
    title: "Building the Foundation",
    description:
      "Development began on Stag.io's core platform — smart matching, application tracking, and university oversight tools.",
  },
  {
    year: "Jun 2026",
    title: "Launch & Growth",
    description:
      "Stag.io officially launches, connecting thousands of students with internship opportunities across multiple industries.",
  },
];

/* ============================================
   Who We Serve
   ============================================ */
const audiences = [
  {
    icon: <HiOutlineAcademicCap size={32} />,
    title: "Students",
    description:
      "Discover internships matched to your skills and interests, apply seamlessly, and track every milestone on one dashboard.",
  },
  {
    icon: <HiOutlineBriefcase size={32} />,
    title: "Companies",
    description:
      "Post opportunities, review top candidates, and manage your intern pipeline with modern, efficient workflows.",
  },
  {
    icon: <HiOutlineGlobe size={32} />,
    title: "Universities",
    description:
      "Monitor student progress, validate internship placements, and ensure academic alignment across your programs.",
  },
];

/* ============================================
   Component
   ============================================ */
export default function AboutPage() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-surface-cream">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-coffee-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center lg:py-36">

          <h1 className="max-w-3xl text-4xl font-heading font-bold leading-tight text-coffee-dark sm:text-5xl lg:text-6xl">
            Bridging the Gap Between{" "}
            <span className="text-coffee-gold">Talent&nbsp;&amp;&nbsp;Opportunity</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Stag.io is an internship management platform that connects students,
            companies, and universities — making internship discovery,
            application, and oversight effortless for everyone.
          </p>
        </div>
      </section>

      {/* ======== MISSION ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            Our Mission
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            We believe every student deserves access to meaningful professional
            experiences. Our mission is to make that a reality.
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
                <h3 className="mb-2 font-heading text-base font-semibold text-coffee-dark">
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
            Our Story
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            From a university project to a platform serving thousands — here is
            how Stag.io came to life.
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
                <h3 className="mt-1 font-heading text-lg font-semibold text-coffee-dark">
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
            Who We Serve
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            Stag.io is designed for every stakeholder in the internship
            ecosystem.
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
                <h3 className="mb-2 font-heading text-lg font-semibold text-coffee-dark">
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
          <h2 className="font-heading text-3xl font-semibold !text-text-inverse sm:text-4xl">
            Join Us in Shaping the{" "}
            <span className="text-coffee-gold">Future of Internships</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-inverse/90">
            Whether you&apos;re a student looking for your first opportunity, a
            company building your talent pipeline, or a university supporting
            your students — Stag.io is here for you.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-gold px-8 py-3.5 text-sm font-semibold text-coffee-dark shadow-lg transition-all hover:bg-coffee-warm hover:text-coffee-dark"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="rounded-button border-2 border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-coffee-gold hover:text-coffee-gold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
