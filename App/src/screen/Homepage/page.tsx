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
import Slide from "@/Components/slide";
import type { SlideData } from "@/Components/slide";

/* ============================================
   Slide Data
   ============================================ */
const slides: SlideData[] = [
  {
    title: "Find Your Perfect Internship",
    description:
      "Browse curated internship opportunities matched to your skills, interests, and academic program. Your next career step is one click away.",
    icon: <HiOutlineBriefcase size={30} />,
  },
  {
    title: "Streamlined Applications",
    description:
      "Apply with your profile, track every stage of your application, and receive real-time updates — all from a single, elegant dashboard.",
    icon: <HiOutlineClipboardList size={30} />,
  },
  {
    title: "University Oversight",
    description:
      "Universities can monitor student progress, validate internships, and ensure academic alignment — effortlessly.",
    icon: <HiOutlineAcademicCap size={30} />,
  },
  {
    title: "Company Talent Pipeline",
    description:
      "Post opportunities, review candidates, and onboard interns with a workflow designed for modern teams.",
    icon: <HiOutlineLightBulb size={30} />,
  },
];

/* ============================================
   Stats
   ============================================ */
const stats = [
  { value: "2,500+", label: "Internships Posted" },
  { value: "800+", label: "Partner Companies" },
  { value: "15,000+", label: "Students Connected" },
  { value: "50+", label: "Universities" },
];

/* ============================================
   Features
   ============================================ */
const features = [
  {
    icon: <HiOutlineBriefcase size={28} />,
    title: "Smart Matching",
    description:
      "Our algorithm matches students with internships based on skills, location, and academic requirements.",
  },
  {
    icon: <HiOutlineClipboardList size={28} />,
    title: "Progress Tracking",
    description:
      "Real-time dashboards for students, supervisors, and universities to track every internship milestone.",
  },
  {
    icon: <HiOutlineUserGroup size={28} />,
    title: "Collaborative Workspace",
    description:
      "Built-in messaging, document sharing, and evaluation tools for seamless collaboration.",
  },
  {
    icon: <HiOutlineShieldCheck size={28} />,
    title: "Verified Partners",
    description:
      "Every company and university on our platform is verified to ensure trust and quality.",
  },
];

/* ============================================
   Component
   ============================================ */
export default function Homepage() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-surface-cream">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-coffee-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-logo-sage/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center lg:py-36">

          <h1 className="max-w-3xl text-4xl font-heading font-bold leading-tight text-coffee-dark sm:text-5xl lg:text-6xl">
            Your Internship Journey{" "}
            <span className="text-coffee-gold">Starts&nbsp;Here</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Stag.io connects students, companies, and universities on one
            elegant platform, making internship discovery, application, and
            management effortless.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-warm px-7 py-3.5 text-sm font-medium text-text-inverse shadow-md transition-all hover:bg-coffee-gold hover:shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="rounded-button border-2 border-coffee-warm px-7 py-3.5 text-sm font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ======== STATS BAR ======== */}
      <section className="border-y border-surface-sand bg-surface-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-coffee-dark">
                {s.value}
              </p>
              <p className="mt-1 text-xs tracking-wide text-text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== HOW IT WORKS — SLIDES ======== */}
      <section className="bg-surface-cream py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            How It Works
          </h2>
          <p className="mb-12 text-center text-sm text-text-muted">
            Swipe through the key steps of the Stag.io experience.
          </p>
          <Slide slides={slides} autoPlayMs={6000} />
        </div>
      </section>

      {/* ======== FEATURES GRID ======== */}
      <section className="border-t border-surface-sand bg-surface-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center font-heading text-3xl font-semibold text-coffee-dark">
            Why Stag.io?
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-text-muted">
            Built from the ground up to solve real internship management
            challenges for every stakeholder.
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
                <h3 className="mb-2 font-heading text-base font-semibold text-coffee-dark">
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
            Trusted By
          </h2>
          <p className="mb-12 text-sm text-text-muted">
            Proudly supporting institutions and organizations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-12">
            {/* UC2 Logo — unicolored #7A4E3A via CSS mix-blend + brightness/sepia filter */}
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
                Université Constantine 2
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="bg-coffee-dark py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold !text-text-inverse sm:text-4xl">
            Ready to Transform Your{" "}
            <span className="text-coffee-gold">Internship Experience</span>?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-inverse/90">
            Join thousands of students, companies, and universities already on
            Stag.io. Sign up today — it&apos;s completely free.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-button bg-coffee-gold px-8 py-3.5 text-sm font-semibold text-coffee-dark shadow-lg transition-all hover:bg-coffee-warm hover:text-coffee-dark"
            >
              Create Free Account
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
