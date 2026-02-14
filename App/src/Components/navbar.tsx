"use client";

import { useState } from "react";
import Link from "next/link";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Internships", href: "/internships" },
  { label: "Companies", href: "/companies" },
  { label: "Universities", href: "/universities" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-sand bg-surface-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ---- Logo ---- */}
        <Link href="/" className="flex items-center gap-1 select-none">
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            <span className="text-coffee-dark">Stag</span>
            <span className="text-coffee-gold">.</span>
            <span className="text-logo-sage">io</span>
          </h1>
        </Link>

        {/* ---- Desktop Links ---- */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative font-body text-sm font-medium text-text-secondary transition-colors hover:text-coffee-dark
                  after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-coffee-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ---- Desktop CTA ---- */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-button border-2 border-coffee-warm px-5 py-2 text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-button bg-coffee-warm px-5 py-2 text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
          >
            Get Started
          </Link>
        </div>

        {/* ---- Mobile Toggle ---- */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="text-coffee-dark md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX size={26} /> : <HiOutlineMenuAlt3 size={26} />}
        </button>
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
              {link.label}
            </Link>
          ))}

          <hr className="border-surface-sand" />

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-button border-2 border-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-coffee-warm transition-colors hover:bg-coffee-warm hover:text-text-inverse"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-button bg-coffee-warm px-5 py-2.5 text-center text-sm font-body font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
