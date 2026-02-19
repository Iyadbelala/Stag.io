"use client";

import Link from "next/link";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { FaLinkedinIn, FaXTwitter, FaGithub, FaInstagram } from "react-icons/fa6";
import Logo from "@/Components/Logo";
import { useLanguage } from "@/Components/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const linkClass = "text-sm text-text-inverse/70 transition-colors hover:text-coffee-gold";

  return (
    <footer className="bg-coffee-dark dark-section">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top — Brand + Nav */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-relaxed text-text-inverse/70">
              {t("footer.description")}
            </p>
            <div className="mt-1 flex flex-col gap-1.5 text-sm text-text-inverse/50">
              <span className="flex items-center gap-2">
                <HiOutlineMail size={14} />
                {t("footer.email")}
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineLocationMarker size={14} />
                {t("footer.location")}
              </span>
            </div>
          </div>

          {/* Platform */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              {t("footer.platform")}
            </span>
            <Link href="/internships" className={linkClass}>{t("footer.internships")}</Link>
            <Link href="/companies" className={linkClass}>{t("footer.companies")}</Link>
            <Link href="/universities" className={linkClass}>{t("footer.universities")}</Link>
            <Link href="/how-it-works" className={linkClass}>{t("footer.howItWorks")}</Link>
          </nav>

          {/* Resources */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              {t("footer.resources")}
            </span>
            <Link href="/blog" className={linkClass}>{t("footer.blog")}</Link>
            <Link href="/help" className={linkClass}>{t("footer.helpCenter")}</Link>
            <Link href="/faqs" className={linkClass}>{t("footer.faqs")}</Link>
            <Link href="/contact" className={linkClass}>{t("footer.contact")}</Link>
          </nav>

          {/* Legal */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-coffee-gold">
              {t("footer.legal")}
            </span>
            <Link href="/privacy" className={linkClass}>{t("footer.privacy")}</Link>
            <Link href="/terms" className={linkClass}>{t("footer.terms")}</Link>
            <Link href="/cookies" className={linkClass}>{t("footer.cookies")}</Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-text-inverse/10" />

        {/* Bottom — Copyright + Socials */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-text-inverse/40">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: FaLinkedinIn, label: "LinkedIn" },
              { icon: FaXTwitter, label: "X" },
              { icon: FaGithub, label: "GitHub" },
              { icon: FaInstagram, label: "Instagram" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-full border border-text-inverse/15 p-2 text-text-inverse/40 transition-colors hover:border-coffee-gold hover:text-coffee-gold"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
